'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Play, AlertTriangle, Check, X } from 'lucide-react';

type Run = {
  id: string;
  channel: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  vehicleCount: number;
  filePath: string | null;
  errorMessage: string | null;
};

type Props = {
  autoTraderEnabled: boolean;
  carGurusEnabled: boolean;
  credentials: { autotrader: boolean; cargurus: boolean };
  runs: Run[];
};

export default function SyndicationControls({ autoTraderEnabled, carGurusEnabled, credentials, runs }: Props) {
  const router = useRouter();
  const [at, setAt] = useState(autoTraderEnabled);
  const [cg, setCg] = useState(carGurusEnabled);
  const [busy, setBusy] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function saveSettings() {
    setBusy('save');
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updates: [
          { key: 'syndication.autotrader.enabled', value: String(at) },
          { key: 'syndication.cargurus.enabled', value: String(cg) }
        ]
      })
    });
    setSavedAt(Date.now());
    setBusy(null);
  }

  async function trigger(channel?: string, dryRun = false) {
    setBusy(channel || 'all');
    const params = new URLSearchParams();
    if (channel) params.set('channel', channel);
    if (dryRun) params.set('dryRun', '1');
    params.set('force', '1');
    await fetch(`/api/syndication/run?${params}`, { method: 'POST' });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-12">
      <section>
        <div className="eyebrow mb-6 pb-3 border-b hairline">Channels</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChannelCard
            name="AutoTrader"
            description="Inventory CSV delivered via SFTP. AutoTrader pulls and ingests on its end."
            enabled={at}
            onToggle={setAt}
            credentialsOk={credentials.autotrader}
            onTrigger={(dry) => trigger('autotrader', dry)}
            busy={busy === 'autotrader'}
            specEndpoint="/api/feeds/autotrader"
          />
          <ChannelCard
            name="CarGurus"
            description="Tab-delimited inventory feed delivered via SFTP."
            enabled={cg}
            onToggle={setCg}
            credentialsOk={credentials.cargurus}
            onTrigger={(dry) => trigger('cargurus', dry)}
            busy={busy === 'cargurus'}
            specEndpoint="/api/feeds/cargurus"
          />
        </div>

        <div className="mt-6 flex gap-3 items-center">
          <button onClick={saveSettings} disabled={busy === 'save'} className="btn-primary">
            {busy === 'save' && <Loader2 size={14} className="animate-spin" />}
            Save Channel Settings
          </button>
          <button onClick={() => trigger(undefined, false)} disabled={!!busy} className="btn-ghost">
            {busy === 'all' && <Loader2 size={14} className="animate-spin" />}
            <Play size={14} /> Run All Now
          </button>
          {savedAt && <span className="font-mono text-[10px] text-copper">Saved.</span>}
        </div>
      </section>

      <section>
        <div className="eyebrow mb-6 pb-3 border-b hairline">Run History</div>
        <div className="border hairline overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b hairline">
              <tr className="text-left">
                <Th>Channel</Th><Th>Started</Th><Th>Duration</Th><Th>Status</Th>
                <Th right>Vehicles</Th><Th>File</Th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-b hairline last:border-0">
                  <Td className="font-mono text-xs uppercase text-copper">{r.channel}</Td>
                  <Td className="font-mono text-xs">{new Date(r.startedAt).toLocaleString()}</Td>
                  <Td className="font-mono text-xs">{r.finishedAt ? formatDuration(r.startedAt, r.finishedAt) : '—'}</Td>
                  <Td>
                    {r.status === 'success' ? <span className="text-copper flex items-center gap-1"><Check size={12} /> success</span>
                      : r.status === 'failed' ? <span className="text-copper-glow flex items-center gap-1"><X size={12} /> failed</span>
                      : <span className="text-cream">{r.status}</span>}
                    {r.errorMessage && <div className="font-mono text-[10px] text-ash mt-1 truncate max-w-xs" title={r.errorMessage}>{r.errorMessage}</div>}
                  </Td>
                  <Td right className="font-mono tabular">{r.vehicleCount}</Td>
                  <Td className="font-mono text-[10px] text-ash truncate max-w-xs" title={r.filePath ?? ''}>{r.filePath ?? '—'}</Td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-ash">No runs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border hairline p-6 bg-ink-700/30">
        <div className="eyebrow mb-3">How it works</div>
        <p className="text-cream/85 text-sm leading-relaxed max-w-3xl">
          AutoTrader and CarGurus do not provide a public REST API for posting inventory.
          They accept a standardized inventory feed via SFTP on a fixed schedule. Configure
          your dealer-specific SFTP credentials in <span className="font-mono text-copper">.env</span>,
          enable the channel above, and the worker will deliver fresh feeds on the schedule defined
          by <span className="font-mono text-copper">SYNDICATION_CRON</span> (default every 6 hours).
          Most partners ingest within a few hours of receiving the feed.
        </p>
      </section>
    </div>
  );
}

function ChannelCard({ name, description, enabled, onToggle, credentialsOk, onTrigger, busy, specEndpoint }: {
  name: string;
  description: string;
  enabled: boolean;
  onToggle: (b: boolean) => void;
  credentialsOk: boolean;
  onTrigger: (dryRun: boolean) => void;
  busy: boolean;
  specEndpoint: string;
}) {
  return (
    <div className="border hairline p-6">
      <div className="flex justify-between items-start gap-4 mb-2">
        <div>
          <div className="display text-3xl">{name}</div>
          <p className="text-ash text-sm mt-2 leading-relaxed">{description}</p>
        </div>
        <label className="cursor-pointer flex items-center gap-2">
          <span className="font-mono text-[10px] text-ash">{enabled ? 'ON' : 'OFF'}</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-5 h-5 accent-copper"
          />
        </label>
      </div>

      {!credentialsOk && (
        <div className="mt-4 flex items-start gap-3 border border-copper/30 bg-copper/5 p-4">
          <AlertTriangle size={14} className="text-copper-glow shrink-0 mt-0.5" />
          <div className="text-xs text-cream/85">
            SFTP credentials missing in <span className="font-mono text-copper">.env</span>.
            Runs will write feeds locally to <span className="font-mono text-copper">/feeds-output</span> but won't be delivered.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-5">
        <button onClick={() => onTrigger(false)} disabled={busy} className="btn-ghost text-xs">
          {busy && <Loader2 size={12} className="animate-spin" />}
          <Play size={12} /> Run Now
        </button>
        <button onClick={() => onTrigger(true)} disabled={busy} className="btn-ghost text-xs">
          Generate Locally (dry run)
        </button>
        <a href={specEndpoint} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
          Preview Feed
        </a>
      </div>
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-4 py-3 spec-label ${right ? 'text-right' : ''}`}>{children}</th>;
}
function Td({ children, right, className, title }: { children: React.ReactNode; right?: boolean; className?: string; title?: string }) {
  return <td className={`px-4 py-3 ${right ? 'text-right' : ''} ${className ?? ''}`} title={title}>{children}</td>;
}

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}
