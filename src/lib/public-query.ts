/**
 * Aurora Serverless v2 with MinCapacity=0 auto-pauses the DB after 5 minutes
 * of inactivity. The first query after a pause sees auth/connection errors
 * for 15-30s while the cluster wakes up. These error codes are how Prisma
 * reports those transient wake-up errors:
 *
 *   P1001 — Can't reach database server
 *   P1002 — Server reached but timed out
 *   P1008 — Operations timed out
 *   P1010 — User was denied access (Aurora returns this while waking)
 *   P1011 — Error opening TLS connection
 *   P1017 — Server closed the connection
 *
 * Plus the connection-pool "Timed out fetching a new connection from the
 * connection pool" message (no error code, just text).
 */
const TRANSIENT_PRISMA_CODES = new Set([
  'P1001', 'P1002', 'P1008', 'P1010', 'P1011', 'P1017'
]);

export function isTransientError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: unknown }).code;
  if (typeof code === 'string' && TRANSIENT_PRISMA_CODES.has(code)) return true;
  const message = (error as { message?: unknown }).message;
  if (typeof message === 'string') {
    if (message.includes('connection pool')) return true;
    if (message.includes('Timed out')) return true;
    if (message.includes('Connection refused')) return true;
  }
  return false;
}

/**
 * Run `query`, retrying on transient errors with exponential backoff.
 * Total wait if every attempt is transient: 2s + 4s + 8s + 16s = ~30s,
 * which covers a typical Aurora Serverless v2 wake-up window.
 * Non-transient errors are thrown immediately (no point retrying).
 */
export async function retryTransient<T>(label: string, query: () => Promise<T>): Promise<T> {
  const backoffsMs = [2000, 4000, 8000, 16000];
  for (let attempt = 0; attempt <= backoffsMs.length; attempt++) {
    try {
      return await query();
    } catch (error) {
      if (!isTransientError(error) || attempt === backoffsMs.length) throw error;
      const delay = backoffsMs[attempt];
      console.warn(`[${label}] transient db error (attempt ${attempt + 1}); retrying in ${delay}ms`);
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }
  // Unreachable — the loop either returns or throws.
  throw new Error(`retryTransient(${label}): exhausted retries`);
}

/**
 * Run `query`, with fast snapshot fallback when the DB is paused.
 *
 * Order (changed from "retry then snapshot" to "fail → snapshot → retry"):
 *
 *  1. One quick attempt against the live DB.
 *  2. If the error is transient (Aurora waking up) AND a snapshotFallback
 *     is provided → try the snapshot immediately. Aurora returns P1010 within
 *     a second or two of the first connection attempt, so this fast-path
 *     check adds < 200ms of S3 latency rather than 15–30s of wait.
 *  3. If no snapshot is available → fall back to the retry loop so the DB
 *     still gets a full chance to wake up and serve live data.
 *  4. If retries also exhaust → empty placeholder.
 *
 * Result: with a snapshot seeded the visitor gets real content in < 2s even
 * when Aurora is paused. Without a snapshot the behaviour is unchanged.
 */
export async function safePublicQuery<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T,
  snapshotFallback?: () => Promise<T | null>
): Promise<T> {
  // Step 1 — fast path: live DB on the first attempt.
  let firstError: unknown;
  try {
    return await query();
  } catch (error) {
    firstError = error;
  }

  // Step 2 — DB waking up: serve from snapshot immediately if we have one.
  if (isTransientError(firstError) && snapshotFallback) {
    try {
      const fromSnapshot = await snapshotFallback();
      if (fromSnapshot != null) {
        console.log(`[public-query] ${label} DB waking; served from snapshot`);
        return fromSnapshot;
      }
    } catch (snapError) {
      console.error(`[public-query] ${label} snapshot read failed`, snapError);
    }
  }

  // Step 3 — no snapshot available: retry with exponential backoff so the
  // DB still gets a chance to wake up and serve live data.
  try {
    return await retryTransient(label, query);
  } catch (error) {
    console.error(`[public-query] ${label} retry exhausted; using empty fallback`, error);
    return fallback;
  }
}
