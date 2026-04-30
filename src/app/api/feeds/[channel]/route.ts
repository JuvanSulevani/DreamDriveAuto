import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildAutoTraderFeed } from '@/lib/syndication/autotrader';
import { buildCarGurusFeed } from '@/lib/syndication/cargurus';
import { buildGenericXmlFeed } from '@/lib/syndication/generic';

export const runtime = 'nodejs';

/**
 * Public read-only feed endpoints. Useful as an HTTPS pull source for any
 * partner that supports HTTP-pull rather than SFTP-push.
 *
 *   GET /api/feeds/autotrader -> AutoTrader CSV
 *   GET /api/feeds/cargurus   -> CarGurus TSV
 *   GET /api/feeds/generic    -> Generic XML
 */
export async function GET(_req: NextRequest, { params }: { params: { channel: string } }) {
  const channel = params.channel;
  if (!['autotrader', 'cargurus', 'generic'].includes(channel)) {
    return NextResponse.json({ error: 'unknown_channel' }, { status: 404 });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'available' },
    include: { photos: { orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });

  const feed =
    channel === 'autotrader' ? buildAutoTraderFeed(vehicles)
    : channel === 'cargurus' ? buildCarGurusFeed(vehicles)
    : buildGenericXmlFeed(vehicles);

  return new NextResponse(feed.body, {
    status: 200,
    headers: {
      'Content-Type': feed.contentType,
      'Content-Disposition': `inline; filename="${feed.filename}"`,
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
    }
  });
}
