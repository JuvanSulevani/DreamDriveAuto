import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { runAllChannels, runSyndicationForChannel } from '@/lib/syndication/runner';

export const runtime = 'nodejs';

/**
 * Manually trigger a syndication run. Admin-only.
 * Optional ?channel=autotrader|cargurus|generic to run a single channel.
 * Optional ?dryRun=1 to skip SFTP delivery (writes feeds to disk only).
 * Optional ?force=1 to run even if the channel is disabled in settings.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const channel = url.searchParams.get('channel');
  const dryRun = url.searchParams.get('dryRun') === '1';
  const force = url.searchParams.get('force') === '1';

  if (channel) {
    if (!['autotrader', 'cargurus', 'generic'].includes(channel)) {
      return NextResponse.json({ error: 'unknown_channel' }, { status: 400 });
    }
    const result = await runSyndicationForChannel(channel as 'autotrader' | 'cargurus' | 'generic', { dryRun, force });
    return NextResponse.json({ result });
  }

  const results = await runAllChannels({ dryRun, force });
  return NextResponse.json({ results });
}
