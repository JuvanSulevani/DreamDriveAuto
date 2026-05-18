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

function isTransient(error: unknown): boolean {
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
      if (!isTransient(error) || attempt === backoffsMs.length) throw error;
      const delay = backoffsMs[attempt];
      console.warn(`[${label}] transient db error (attempt ${attempt + 1}); retrying in ${delay}ms`);
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }
  // Unreachable — the loop either returns or throws.
  throw new Error(`retryTransient(${label}): exhausted retries`);
}

export async function safePublicQuery<T>(
  label: string,
  query: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await retryTransient(label, query);
  } catch (error) {
    console.error(`[public-query] ${label} failed; rendering fallback content.`, error);
    return fallback;
  }
}
