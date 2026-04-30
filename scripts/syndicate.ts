/**
 * One-shot syndication script.
 *   tsx scripts/syndicate.ts                      -> all channels (using settings)
 *   tsx scripts/syndicate.ts autotrader            -> single channel
 *   tsx scripts/syndicate.ts --dry-run             -> write feeds locally only
 *   tsx scripts/syndicate.ts --force               -> run even if disabled in settings
 */
import { runAllChannels, runSyndicationForChannel } from '../src/lib/syndication/runner';

async function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('--')));
  const channel = args.find((a) => !a.startsWith('--'));
  const opts = { dryRun: flags.has('--dry-run'), force: flags.has('--force') };

  console.log(`[syndicate] starting · channel=${channel ?? 'all'} dryRun=${opts.dryRun} force=${opts.force}`);

  const results = channel
    ? [await runSyndicationForChannel(channel as 'autotrader' | 'cargurus' | 'generic', opts)]
    : await runAllChannels(opts);

  for (const r of results) {
    const status = r.ok ? 'OK' : 'FAIL';
    console.log(`[syndicate] ${status} · ${r.channel} · ${r.vehicleCount} vehicles · ${r.remotePath || r.localPath || ''} ${r.error ? '(' + r.error + ')' : ''}`);
  }

  const failed = results.filter((r) => !r.ok && r.error !== 'channel_disabled' && r.error !== 'sftp_credentials_missing');
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
