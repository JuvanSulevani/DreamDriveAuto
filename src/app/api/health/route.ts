import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { retryTransient } from '@/lib/public-query';
import { writeSnapshot } from '@/lib/snapshot';

// Force the route to run on every request (no static optimisation).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Keep-warm endpoint hit by EventBridge every 5 minutes.
 *
 * Goals:
 *  - Always reach Lambda (no CDN caching).
 *  - Actually wake/keep Aurora Serverless v2 warm. A single fast-failing
 *    SELECT 1 returns in <1s while the cluster is mid-resume, so the old
 *    version reported db:false and the cluster stayed paused. retryTransient
 *    holds through the wake-up window so the ping genuinely warms the pool.
 *  - Refresh the public S3 snapshot whenever the DB is reachable. This is the
 *    only thing that guarantees the snapshot exists without an admin save, so
 *    the dynamic inventory page (and any ISR regeneration that races a pause)
 *    always has fresh fallback data to serve.
 */
export async function GET() {
  let dbOk = false;
  try {
    // Hold the connection through Aurora's resume so the ping truly warms it.
    await retryTransient('health', () => prisma.$queryRaw`SELECT 1`);
    dbOk = true;
  } catch (err) {
    console.error('[health] db ping failed', err);
  }

  if (dbOk) {
    // Keeps snapshots/site-snapshot.json fresh (≤ keep-warm interval old).
    await writeSnapshot();
  }

  return new NextResponse(JSON.stringify({ ok: true, db: dbOk, ts: Date.now() }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store',
      'Pragma': 'no-cache'
    }
  });
}
