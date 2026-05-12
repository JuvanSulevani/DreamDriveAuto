'use client';

import { useMemo, useState } from 'react';
import { Check, Loader2, RotateCcw, Save } from 'lucide-react';
import type { SiteSettingField } from '@/lib/site-settings';

type Props = {
  fields: SiteSettingField[];
  values: Record<string, string>;
};

export default function SettingsForm({ fields, values }: Props) {
  const [draft, setDraft] = useState(values);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, SiteSettingField[]>();
    for (const field of fields) {
      map.set(field.group, [...(map.get(field.group) ?? []), field]);
    }
    return Array.from(map.entries());
  }, [fields]);

  async function save() {
    setStatus('saving');
    setError(null);

    const updates = fields.map((field) => ({
      key: field.key,
      value: draft[field.key] ?? ''
    }));

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Settings could not be saved.');
      setStatus('error');
      return;
    }

    setStatus('saved');
    window.setTimeout(() => setStatus('idle'), 1800);
  }

  return (
    <div className="max-w-5xl">
      <div className="sticky top-0 z-10 -mx-1 mb-10 flex flex-wrap items-center justify-between gap-4 bg-ink/95 px-1 py-4 backdrop-blur">
        <div>
          <div className="eyebrow text-ash">Editable site content</div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ash">
            These values feed the public showroom pages, header, footer, and customer-facing contact details.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setDraft(values);
              setStatus('idle');
              setError(null);
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button type="button" className="btn-primary" disabled={status === 'saving'} onClick={save}>
            {status === 'saving' ? <Loader2 size={14} className="animate-spin" /> : status === 'saved' ? <Check size={14} /> : <Save size={14} />}
            {status === 'saved' ? 'Saved' : 'Save Settings'}
          </button>
        </div>
      </div>

      {error && <div className="mb-8 border border-copper/40 bg-copper/10 p-4 font-mono text-xs text-copper-glow">{error}</div>}

      <div className="space-y-14">
        {groups.map(([group, groupFields]) => (
          <section key={group}>
            <div className="eyebrow mb-6 border-b hairline pb-3">{group}</div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              {groupFields.map((field) => (
                <Field
                  key={field.key}
                  field={field}
                  value={draft[field.key] ?? ''}
                  onChange={(value) => {
                    setDraft((current) => ({ ...current, [field.key]: value }));
                    if (status !== 'saving') setStatus('idle');
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Field({
  field,
  value,
  onChange
}: {
  field: SiteSettingField;
  value: string;
  onChange: (value: string) => void;
}) {
  const wide = field.input === 'textarea';
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <label className="field-label">{field.label}</label>
      {field.input === 'textarea' ? (
        <textarea
          className="input-field resize-none"
          rows={field.rows ?? 3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="input-field"
          type={field.input}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
