import { ensureAdmin } from '@/lib/require-admin';
import { DEALER } from '@/lib/dealer';

export default async function SettingsPage() {
  await ensureAdmin();

  return (
    <>
      <div className="mb-10">
        <div className="eyebrow text-ash">Configuration</div>
        <h1 className="display text-5xl mt-2">Settings</h1>
      </div>

      <div className="space-y-12 max-w-3xl">
        <section>
          <div className="eyebrow mb-6 pb-3 border-b hairline">Dealer Information</div>
          <p className="text-ash text-sm leading-relaxed">
            Dealer-wide values such as name, address, phone, and website are loaded from environment variables
            so they remain consistent across web pages, syndication feeds, and email notifications. Update
            them in <span className="font-mono text-copper">.env</span> and restart the server.
          </p>
          <div className="border hairline mt-6 divide-y divide-ink-500">
            <Row label="Dealer Name" value={DEALER.name} />
            <Row label="Phone" value={DEALER.phone} />
            <Row label="Address" value={DEALER.address} />
            <Row label="Website" value={DEALER.website} />
          </div>
        </section>

        <section>
          <div className="eyebrow mb-6 pb-3 border-b hairline">Email Notifications</div>
          <p className="text-ash text-sm leading-relaxed">
            Lead notifications are delivered to <span className="font-mono text-copper">{process.env.LEADS_NOTIFY_TO || '(unset)'}</span>
            via SMTP host <span className="font-mono text-copper">{process.env.SMTP_HOST || '(unset — leads will be saved but not emailed)'}</span>.
          </p>
        </section>

        <section>
          <div className="eyebrow mb-6 pb-3 border-b hairline">Syndication Schedule</div>
          <p className="text-ash text-sm leading-relaxed">
            The syndication worker runs on cron schedule <span className="font-mono text-copper">{process.env.SYNDICATION_CRON || '0 */6 * * *'}</span>.
            Run <span className="font-mono text-copper">npm run syndicate:watch</span> to start the worker.
          </p>
        </section>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-5 py-4">
      <div className="spec-label">{label}</div>
      <div className="col-span-2 text-cream font-mono text-xs break-all">{value}</div>
    </div>
  );
}
