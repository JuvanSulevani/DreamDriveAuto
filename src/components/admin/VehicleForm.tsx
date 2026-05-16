'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, Upload, Plus, GripVertical } from 'lucide-react';

type Photo = { url: string; alt?: string | null };

export type VehicleInput = {
  id?: string;
  vin: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  bodyStyle: string;
  condition: string;
  engine?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  fuelType?: string | null;
  cityMpg?: number | null;
  highwayMpg?: number | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  doors?: number | null;
  seats?: number | null;
  mileage: number;
  price: number; // cents
  msrp?: number | null;
  status: string;
  headline?: string | null;
  description?: string | null;
  features?: string | null;
  accidentFree: boolean;
  oneOwner: boolean;
  serviceRecords: boolean;
  carfaxUrl?: string | null;
  featured: boolean;
  photos: Photo[];
};

const empty: VehicleInput = {
  vin: '', stockNumber: '', year: new Date().getFullYear(),
  make: '', model: '', trim: '', bodyStyle: 'Sedan', condition: 'used',
  engine: '', transmission: '', drivetrain: '', fuelType: 'Gasoline',
  cityMpg: null, highwayMpg: null,
  exteriorColor: '', interiorColor: '',
  doors: 4, seats: 5,
  mileage: 0, price: 0, msrp: null,
  status: 'available',
  headline: '', description: '', features: '',
  accidentFree: true, oneOwner: false, serviceRecords: false,
  carfaxUrl: '', featured: false, photos: []
};

type Props = { initial?: VehicleInput };

export default function VehicleForm({ initial }: Props) {
  const router = useRouter();
  const [v, setV] = useState<VehicleInput>(initial ?? empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isEdit = Boolean(initial?.id);

  function set<K extends keyof VehicleInput>(key: K, value: VehicleInput[K]) {
    setV((s) => ({ ...s, [key]: value }));
  }

  async function uploadPhoto(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('upload_failed');
    const data = await res.json();
    return data.url as string;
  }

  async function onPhotoFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        urls.push(await uploadPhoto(f));
      }
      setV((s) => ({ ...s, photos: [...s.photos, ...urls.map((u) => ({ url: u, alt: '' }))] }));
    } catch {
      setErr('Photo upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(i: number) {
    setV((s) => ({ ...s, photos: s.photos.filter((_, idx) => idx !== i) }));
  }

  function movePhoto(i: number, dir: -1 | 1) {
    setV((s) => {
      const next = [...s.photos];
      const j = i + dir;
      if (j < 0 || j >= next.length) return s;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...s, photos: next };
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);

    const url = isEdit ? `/api/vehicles/${initial!.id}` : '/api/vehicles';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(formatSaveError(data));
      return;
    }

    router.push('/admin/inventory');
    router.refresh();
  }

  async function remove() {
    if (!isEdit) return;
    if (!confirm('Delete this vehicle? This cannot be undone.')) return;
    const res = await fetch(`/api/vehicles/${initial!.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin/inventory');
      router.refresh();
    }
  }

  return (
    <form onSubmit={save} className="max-w-5xl space-y-12">
      <Section title="Identification">
        <Grid>
          <F label="VIN *"><input className="input-field" value={v.vin} onChange={(e) => set('vin', e.target.value.toUpperCase())} required maxLength={17} /></F>
          <F label="Stock Number *"><input className="input-field" value={v.stockNumber} onChange={(e) => set('stockNumber', e.target.value)} required /></F>
          <F label="Year *"><input type="text" inputMode="numeric" className="input-field" value={String(v.year)} onChange={(e) => set('year', parseInt(e.target.value, 10) || new Date().getFullYear())} required /></F>
          <F label="Make *"><input className="input-field" value={v.make} onChange={(e) => set('make', e.target.value)} required /></F>
          <F label="Model *"><input className="input-field" value={v.model} onChange={(e) => set('model', e.target.value)} required /></F>
          <F label="Trim"><input className="input-field" value={v.trim ?? ''} onChange={(e) => set('trim', e.target.value)} /></F>
          <F label="Body Style *">
            <select className="input-field" value={v.bodyStyle} onChange={(e) => set('bodyStyle', e.target.value)}>
              {['Sedan','Coupe','Convertible','Wagon','Hatchback','SUV','Truck','Van','Minivan'].map((b) => <option key={b}>{b}</option>)}
            </select>
          </F>
          <F label="Condition *">
            <select className="input-field" value={v.condition} onChange={(e) => set('condition', e.target.value)}>
              <option value="new">New</option>
              <option value="certified">Certified Pre-Owned</option>
              <option value="used">Pre-Owned</option>
            </select>
          </F>
        </Grid>
      </Section>

      <Section title="Powertrain & Specs">
        <Grid>
          <F label="Engine"><input className="input-field" value={v.engine ?? ''} onChange={(e) => set('engine', e.target.value)} /></F>
          <F label="Transmission"><input className="input-field" value={v.transmission ?? ''} onChange={(e) => set('transmission', e.target.value)} /></F>
          <F label="Drivetrain">
            <select className="input-field" value={v.drivetrain ?? ''} onChange={(e) => set('drivetrain', e.target.value)}>
              <option value="">—</option>
              <option>FWD</option><option>RWD</option><option>AWD</option><option>4WD</option>
            </select>
          </F>
          <F label="Fuel Type">
            <select className="input-field" value={v.fuelType ?? ''} onChange={(e) => set('fuelType', e.target.value)}>
              <option value="">—</option>
              <option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Plug-in Hybrid</option><option>Electric</option>
            </select>
          </F>
          <F label="City fuel economy (L/100km)"><input type="text" inputMode="decimal" className="input-field" value={v.cityMpg ?? ''} onChange={(e) => set('cityMpg', e.target.value ? parseFloat(e.target.value) : null)} /></F>
          <F label="Hwy fuel economy (L/100km)"><input type="text" inputMode="decimal" className="input-field" value={v.highwayMpg ?? ''} onChange={(e) => set('highwayMpg', e.target.value ? parseFloat(e.target.value) : null)} /></F>
          <F label="Exterior Color"><input className="input-field" value={v.exteriorColor ?? ''} onChange={(e) => set('exteriorColor', e.target.value)} /></F>
          <F label="Interior Color"><input className="input-field" value={v.interiorColor ?? ''} onChange={(e) => set('interiorColor', e.target.value)} /></F>
          <F label="Doors"><input type="text" inputMode="numeric" className="input-field" value={v.doors ?? ''} onChange={(e) => set('doors', e.target.value ? parseInt(e.target.value, 10) : null)} /></F>
          <F label="Seats"><input type="text" inputMode="numeric" className="input-field" value={v.seats ?? ''} onChange={(e) => set('seats', e.target.value ? parseInt(e.target.value, 10) : null)} /></F>
        </Grid>
      </Section>

      <Section title="Pricing & Status">
        <Grid>
          <F label="Mileage *"><input type="text" inputMode="numeric" className="input-field" value={String(v.mileage)} onChange={(e) => set('mileage', parseInt(e.target.value, 10) || 0)} required /></F>
          <F label="Price (CAD) *"><input type="text" inputMode="decimal" className="input-field" value={v.price === 0 ? '' : String(v.price / 100)} onChange={(e) => set('price', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : 0)} required /></F>
          <F label="MSRP (CAD)"><input type="text" inputMode="decimal" className="input-field" value={v.msrp ? String(v.msrp / 100) : ''} onChange={(e) => set('msrp', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)} /></F>
          <F label="Status">
            <select className="input-field" value={v.status} onChange={(e) => set('status', e.target.value)}>
              <option value="available">Available</option>
              <option value="pending">Pending Sale</option>
              <option value="sold">Sold</option>
              <option value="hidden">Hidden (offline)</option>
            </select>
          </F>
        </Grid>
      </Section>

      <Section title="Marketing">
        <F label="Headline (one liner)"><input className="input-field" value={v.headline ?? ''} onChange={(e) => set('headline', e.target.value)} /></F>
        <F label="Description"><textarea className="input-field resize-none" rows={5} value={v.description ?? ''} onChange={(e) => set('description', e.target.value)} /></F>
        <F label="Features (comma separated)"><textarea className="input-field resize-none" rows={2} value={v.features ?? ''} onChange={(e) => set('features', e.target.value)} placeholder="Apple CarPlay, Heated Seats, Pano Roof" /></F>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
          <Toggle label="Featured on home" checked={v.featured} onChange={(c) => set('featured', c)} />
          <Toggle label="One-Owner" checked={v.oneOwner} onChange={(c) => set('oneOwner', c)} />
          <Toggle label="Accident-Free" checked={v.accidentFree} onChange={(c) => set('accidentFree', c)} />
          <Toggle label="Service Records" checked={v.serviceRecords} onChange={(c) => set('serviceRecords', c)} />
        </div>
        <F label="CarFax URL"><input className="input-field" value={v.carfaxUrl ?? ''} onChange={(e) => set('carfaxUrl', e.target.value)} placeholder="https://www.carfax.com/..." /></F>
      </Section>

      <Section title={`Photos (${v.photos.length})`}>
        <label className="btn-ghost cursor-pointer w-fit">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Upload Photos
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onPhotoFiles(e.target.files)} />
        </label>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {v.photos.map((p, i) => (
            <div key={i} className="relative group">
              <div className="aspect-[4/3] bg-ink-700 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-2 left-2 font-mono text-[9px] bg-ink/80 px-1.5 py-1">
                {String(i + 1).padStart(2, '0')}{i === 0 ? ' · HERO' : ''}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 to-transparent p-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <button type="button" onClick={() => movePhoto(i, -1)} className="bg-ink/80 hover:bg-copper text-cream p-1.5"><GripVertical size={12} /></button>
                </div>
                <button type="button" onClick={() => removePhoto(i)} className="bg-ink/80 hover:bg-copper text-cream p-1.5"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {v.photos.length === 0 && (
            <div className="col-span-full border hairline border-dashed p-12 text-center text-ash">
              <Plus className="mx-auto mb-3" size={20} />
              No photos yet. The first photo becomes the hero.
            </div>
          )}
        </div>
      </Section>

      {err && <div className="font-mono text-sm text-copper-glow">{err}</div>}

      <div className="flex gap-4 sticky bottom-0 bg-ink py-6 border-t hairline">
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Vehicle'}
        </button>
        {isEdit && (
          <button type="button" className="btn-ghost text-copper-glow border-copper/30" onClick={remove}>
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="eyebrow mb-6 pb-3 border-b hairline">{title}</div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">{children}</div>;
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-copper w-4 h-4"
      />
      <span className="text-cream text-sm">{label}</span>
    </label>
  );
}

function formatSaveError(data: { error?: string; issues?: { path?: (string | number)[]; message?: string }[] }) {
  if (Array.isArray(data.issues) && data.issues.length > 0) {
    const issue = data.issues[0];
    const field = issue.path?.join('.') || 'field';
    return `Check ${field}: ${issue.message || 'invalid value'}.`;
  }

  if (data.error === 'validation') return 'Check the highlighted vehicle details and try again.';
  if (data.error === 'unauthorized') return 'Your admin session expired. Sign in again.';
  return data.error || 'Save failed.';
}
