'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

type Lead = {
  id: string;
  type: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  payload: string | null;
  source: string;
  createdAt: string;
  vehicle: { year: number; make: string; model: string; slug: string } | null;
};

const TYPE_LABEL: Record<string, string> = {
  contact: 'Contact',
  financing: 'Financing',
  trade_in: 'Trade-In',
  sell: 'Sell',
  test_drive: 'Test Drive'
};

export default function LeadsTable({ leads, loadError = false }: { leads: Lead[]; loadError?: boolean }) {
  const [filter, setFilter] = useState<string>('all');
  const [open, setOpen] = useState<string | null>(null);

  const filtered = filter === 'all' ? leads : leads.filter((l) => l.type === filter);

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-6">
        <Filter active={filter === 'all'} onClick={() => setFilter('all')} label={`All (${leads.length})`} />
        {Object.entries(TYPE_LABEL).map(([k, v]) => {
          const c = leads.filter((l) => l.type === k).length;
          return <Filter key={k} active={filter === k} onClick={() => setFilter(k)} label={`${v} (${c})`} />;
        })}
      </div>

      <div className="border hairline">
        {loadError && (
          <div className="border-b border-copper/40 bg-copper/10 p-5 font-mono text-xs text-copper-glow">
            Leads could not be loaded from the database. Refresh the page or check the deployment logs.
          </div>
        )}
        {filtered.map((l) => (
          <div key={l.id} className="border-b hairline last:border-0">
            <button
              onClick={() => setOpen(open === l.id ? null : l.id)}
              className="w-full px-5 py-4 hover:bg-ink-700 transition-colors flex items-center gap-4 text-left"
            >
              <div className="font-mono text-[10px] tracking-ticker uppercase text-copper w-24 shrink-0">
                {TYPE_LABEL[l.type] || l.type}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-cream truncate">{l.firstName} {l.lastName}</div>
                <div className="font-mono text-xs text-ash truncate">{l.email}</div>
              </div>
              {l.vehicle && (
                <div className="text-xs text-cream/70 hidden md:block truncate max-w-[240px]">
                  {l.vehicle.year} {l.vehicle.make} {l.vehicle.model}
                </div>
              )}
              <div className="font-mono text-[10px] text-ash whitespace-nowrap">
                {new Date(l.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>
              {open === l.id ? <ChevronUp size={14} className="text-ash" /> : <ChevronDown size={14} className="text-ash" />}
            </button>

            {open === l.id && (
              <div className="px-5 pb-6 bg-ink-700/40">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
                  <div className="md:col-span-4 space-y-3">
                    <a className="flex items-center gap-2 text-cream hover:text-copper" href={`mailto:${l.email}`}>
                      <Mail size={14} className="text-copper" /> {l.email}
                    </a>
                    {l.phone && (
                      <a className="flex items-center gap-2 text-cream hover:text-copper" href={`tel:${l.phone.replace(/[^0-9+]/g, '')}`}>
                        <Phone size={14} className="text-copper" /> {l.phone}
                      </a>
                    )}
                    <div className="font-mono text-[10px] text-ash mt-3">
                      Source · {l.source || '—'}
                    </div>
                    {l.vehicle && (
                      <Link href={`/inventory/${l.vehicle.slug}`} target="_blank"
                        className="font-mono text-[10px] text-cream hover:text-copper flex items-center gap-1 mt-2">
                        View vehicle <ExternalLink size={11} />
                      </Link>
                    )}
                  </div>
                  <div className="md:col-span-8">
                    {l.message && (
                      <>
                        <div className="spec-label mb-2">Message</div>
                        <p className="text-cream/85 leading-relaxed whitespace-pre-wrap">{l.message}</p>
                      </>
                    )}
                    {l.payload && (
                      <>
                        <div className="spec-label mb-2 mt-4">Submission Data</div>
                        <pre className="font-mono text-[11px] text-ash bg-ink p-4 overflow-x-auto whitespace-pre-wrap">{tryFormatJson(l.payload)}</pre>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="p-12 text-center text-ash">No leads.</div>}
      </div>
    </>
  );
}

function Filter({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 font-mono text-[11px] tracking-wider border ${active ? 'bg-copper border-copper text-cream' : 'border-ink-500 text-ash hover:border-cream/30'}`}>
      {label}
    </button>
  );
}

function tryFormatJson(s: string) {
  try { return JSON.stringify(JSON.parse(s), null, 2); }
  catch { return s; }
}
