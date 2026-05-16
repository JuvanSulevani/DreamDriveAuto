'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Play, AlertTriangle, Check, X, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';

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

type SftpCreds = {
  host: string;
  port: string;
  user: string;
  pass: string;
  path: string;
};

type Props = {
  autoTraderEnabled: boolean;
  carGurusEnabled: boolean;
  credentials: { autotrader: boolean; cargurus: boolean };
  sftpValues: { autotrader: SftpCreds; cargurus: SftpCreds };
  runs: Run[];
};

export default function SyndicationControls({ autoTraderEnabled, carGurusEnabled, credentials, sftpValues, runs }: Props) {
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
            channel="autotrader"
            name="AutoTrader"
            description="Inventory CSV delivered via SFTP. AutoTrader pulls and ingests on its end."
            enabled={at}
            onToggle={setAt}
            credentialsOk={credentials.autotrader}
            initialCreds={sftpValues.autotrader}
            onTrigger={(dry) => trigger('autotrader', dry)}
            busy={busy === 'autotrader'}
            specEndpoint="/api/feeds/autotrader"
          />
          <ChannelCard
            channel="cargurus"
            name="CarGurus"
            description="Tab-delimited inventory feed delivered via SFTP."
            enabled={cg}
            onToggle={setCg}
            credentialsOk={credentials.cargurus}
            initialCreds={sftpValues.cargurus}
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
          AutoTrader and CarGurus accept inventory feeds via SFTP on a fixed schedule.
          Enter your dealer-specific SFTP credentials in the channel cards above, enable the channel,
          and the worker will deliver fresh feeds on the schedule defined by{' '}
          <span className="font-mono text-copper">SYNDICATION_CRON</span> (default every 6 hours).
          Credentials are stored securely in the database. Environment-variable credentials
          (e.g. <span className="font-mono text-copper">AUTOTRADER_SFTP_HOST</span>) are still
          honoured as a fallback. Most partners ingest within a few hours of receiving the feed.
        </p>
      </section>
    </div>
  );
}

function ChannelCard({
  channel,
  name,
  description,
  enabled,
  onToggle,
  credentialsOk,
  initialCreds,
  onTrigger,
  busy,
  specEndpoint,
}: {
  channel: string;
  name: string;
  description: string;
  enabled: boolean;
  onToggle: (b: boolean) => void;
  credentialsOk: boolean;
  initialCreds: SftpCreds;
  onTrigger: (dryRun: boolean) => void;
  busy: boolean;
  specEndpoint: string;
}) {
  const [showCreds, setShowCreds] = useState(!credentialsOk);
  const [creds, setCreds] = useState<SftpCreds>(initialCreds);
  const [credsBusy, setCredsBusy] = useState(false);
  const [credsSavedAt, setCredsSavedAt] = useState<number | null>(null);
  const [credsError, setCredsError] = useState<string | null>(null);

  function setField(field: keyof SftpCreds, value: string) {
    setCreds((prev) => ({ ...prev, [field]: value }));
  }

  async function saveCreds() {
    setCredsBusy(true);
    setCredsError(null);
    try {
      const updates = [
        { key: `syndication.${channel}.sftp.host`, value: creds.host },
        { key: `syndication.${channel}.sftp.port`, value: creds.port },
        { key: `syndication.${channel}.sftp.user`, value: creds.user },
        { key: `syndication.${channel}.sftp.pass`, value: creds.pass },
        { key: `syndication.${channel}.sftp.path`, value: creds.path },
      ].filter((u) => u.value.trim() !== '' || u.key.endsWith('.pass'));

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (!res.ok) throw new Error('Save failed');
      setCredsSavedAt(Date.now());
    } catch {
      setCredsError('Failed to save. Please try again.');
    } finally {
      setCredsBusy(false);
    }
  }

  return (
    <div className="border hairline p-6">
      <div className="flex justify-between items-start gap-4 mb-2">
        <div>
          <div className="display text-3xl">{name}</div>
          <p className="text-ash text-sm mt-2 leading-relaxed">{description}</p>
        </div>
        <label className="cursor-pointer flex items-center gap-2 shrink-0">
          <span className="font-mono text-[10px] text-ash">{enabled ? 'ON' : 'OFF'}</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-5 h-5 accent-copper"
          />
        </label>
      </div>

      {!credentialsOk && !showCreds && (
        <div className="mt-4 flex items-start gap-3 border border-copper/30 bg-copper/5 p-4">
          <AlertTriangle size={14} className="text-copper-glow shrink-0 mt-0.5" />
          <div className="text-xs text-cream/85 flex-1">
            SFTP credentials not configured. Feeds will be written locally but not delivered.
          </div>
          <button
            onClick={() => setShowCreds(true)}
            className="text-copper font-mono text-[10px] hover:text-cream shrink-0"
          >
            Configure →
          </button>
        </div>
      )}

      {/* SFTP Credentials Toggle */}
      <button
        onClick={() => setShowCreds((s) => !s)}
        className="mt-5 flex items-center gap-2 font-mono text-[10px] text-ash hover:text-cream transition-colors"
      >
        <KeyRound size={12} />
        SFTP Credentials
        {credentialsOk && <span className="text-copper ml-1">✓ configured</span>}
        {showCreds ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {showCreds && (
        <div className="mt-4 border hairline p-5 space-y-4 bg-ink-700/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Host</label>
              <input
                type="text"
                className="input-field"
                placeholder="sftp.example.com"
                value={creds.host}
                onChange={(e) => setField('host', e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="field-label">Port</label>
              <input
                type="text"
                inputMode="numeric"
                className="input-field"
                placeholder="22"
                value={creds.port}
                onChange={(e) => setField('port', e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="field-label">Username</label>
              <input
                type="text"
                className="input-field"
                placeholder="dealer_username"
                value={creds.user}
                onChange={(e) => setField('user', e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder={initialCreds.pass ? '••••••••' : 'Enter password'}
                value={creds.pass}
                onChange={(e) => setField('pass', e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Remote Path</label>
              <input
                type="text"
                className="input-field"
                placeholder="/inventory"
                value={creds.path}
                onChange={(e) => setField('path', e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveCreds}
              disabled={credsBusy}
              className="btn-primary text-xs"
            >
              {credsBusy && <Loader2 size={12} className="animate-spin" />}
              Save Credentials
            </button>
            {credsSavedAt && (
              <span className="font-mono text-[10px] text-copper flex items-center gap-1">
                <Check size={10} /> Saved
              </span>
            )}
            {credsError && (
              <span className="font-mono text-[10px] text-copper-glow">{credsError}</span>
            )}
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
