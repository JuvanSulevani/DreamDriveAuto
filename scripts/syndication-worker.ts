/**
 * Long-running syndication worker.
 * Runs on a cron schedule (env: SYNDICATION_CRON, default every 6 hours)
 * and triggers all enabled syndication channels.
 *
 * Run with: npm run syndicate:watch
 * Or supervise with PM2 / systemd / Docker.
 */
import cron from 'node-cron';
import { runAllChannels } from '../src/lib/syndication/runner';

const schedule = process.env.SYNDICATION_CRON || '0 */6 * * *';

if (!cron.validate(schedule)) {
  console.error(`[worker] invalid cron expression: ${schedule}`);
  process.exit(1);
}

console.log(`[worker] starting · schedule="${schedule}"`);

async function tick() {
  const startedAt = new Date();
  console.log(`[worker] run @ ${startedAt.toISOString()}`);
  try {
    const results = await runAllChannels();
    for (const r of results) {
      const status = r.ok ? 'OK' : 'FAIL';
      console.log(`[worker]  ${status} · ${r.channel} · ${r.vehicleCount} vehicles · ${r.remotePath || r.localPath || ''} ${r.error ? '(' + r.error + ')' : ''}`);
    }
  } catch (e) {
    console.error('[worker] run failed:', e);
  }
}

cron.schedule(schedule, tick);

// Run once at startup so the operator can see immediate output.
tick();

// Keep the process alive
process.stdin.resume();
process.on('SIGINT', () => { console.log('[worker] shutting down'); process.exit(0); });
process.on('SIGTERM', () => { console.log('[worker] shutting down'); process.exit(0); });
