import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force the route to run on every request (no static optimisation).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Keep-warm endpoint hit by EventBridge every 5 minutes.
 *
 * Goals:
 *  - Always reach Lambda (no CDN caching).
 *  - Also warm the Prisma → RDS (IAM auth) connection pool, which is what
 *    actually causes the slow first inventory render after idle.
 */
export async function GET() {
  let dbOk = false;
  try {
    // Cheap query that forces Prisma to open a pooled connection.
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    console.error('[health] db ping failed', err);
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
