'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sliders, X } from 'lucide-react';

type FilterState = {
  q: string;
  make: string;
  bodyStyle: string;
  condition: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  sort: string;
};

const empty: FilterState = {
  q: '', make: '', bodyStyle: '', condition: '',
  priceMin: '', priceMax: '', yearMin: '', yearMax: '',
  sort: 'newest'
};

type Props = {
  makes: string[];
  bodyStyles: string[];
};

export default function InventoryFilters({ makes, bodyStyles }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [state, setState] = useState<FilterState>(empty);
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    setState({
      q: params.get('q') || '',
      make: params.get('make') || '',
      bodyStyle: params.get('bodyStyle') || '',
      condition: params.get('condition') || '',
      priceMin: params.get('priceMin') || '',
      priceMax: params.get('priceMax') || '',
      yearMin: params.get('yearMin') || '',
      yearMax: params.get('yearMax') || '',
      sort: params.get('sort') || 'newest'
    });
  }, [params]);

  function apply(next: FilterState) {
    const q = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => { if (v) q.set(k, v); });
    router.push(`/inventory?${q.toString()}`);
    setOpenMobile(false);
  }

  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  const Body = (
    <div className="space-y-8">
      <div>
        <label className="field-label">Search</label>
        <input
          className="input-field"
          placeholder="Make, model, VIN, stock #"
          value={state.q}
          onChange={(e) => update('q', e.target.value)}
        />
      </div>

      <Select
        label="Condition"
        value={state.condition}
        onChange={(v) => update('condition', v)}
        options={[
          { value: '', label: 'Any' },
          { value: 'new', label: 'New' },
          { value: 'certified', label: 'Certified' },
          { value: 'used', label: 'Pre-Owned' }
        ]}
      />

      <Select
        label="Make"
        value={state.make}
        onChange={(v) => update('make', v)}
        options={[{ value: '', label: 'Any' }, ...makes.map((m) => ({ value: m, label: m }))]}
      />

      <Select
        label="Body Style"
        value={state.bodyStyle}
        onChange={(v) => update('bodyStyle', v)}
        options={[{ value: '', label: 'Any' }, ...bodyStyles.map((b) => ({ value: b, label: b }))]}
      />

      <div>
        <label className="field-label">Price Range</label>
        <div className="grid grid-cols-2 gap-3">
          <input className="input-field" placeholder="Min" inputMode="numeric"
            value={state.priceMin} onChange={(e) => update('priceMin', e.target.value)} />
          <input className="input-field" placeholder="Max" inputMode="numeric"
            value={state.priceMax} onChange={(e) => update('priceMax', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="field-label">Year</label>
        <div className="grid grid-cols-2 gap-3">
          <input className="input-field" placeholder="From" inputMode="numeric"
            value={state.yearMin} onChange={(e) => update('yearMin', e.target.value)} />
          <input className="input-field" placeholder="To" inputMode="numeric"
            value={state.yearMax} onChange={(e) => update('yearMax', e.target.value)} />
        </div>
      </div>

      <Select
        label="Sort"
        value={state.sort}
        onChange={(v) => update('sort', v)}
        options={[
          { value: 'newest', label: 'Newest Listings' },
          { value: 'price_asc', label: 'Price · Low → High' },
          { value: 'price_desc', label: 'Price · High → Low' },
          { value: 'mileage_asc', label: 'Lowest Mileage' },
          { value: 'year_desc', label: 'Newest Model Year' }
        ]}
      />

      <div className="flex gap-3 pt-4">
        <button className="btn-primary flex-1 justify-center" onClick={() => apply(state)}>
          Apply
        </button>
        <button className="btn-ghost" onClick={() => apply(empty)}>
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden btn-ghost w-full justify-center"
        onClick={() => setOpenMobile(true)}
      >
        <Sliders size={14} /> Filters
      </button>

      <aside className="hidden lg:block sticky top-28 self-start">
        {Body}
      </aside>

      {openMobile && (
        <div className="fixed inset-0 z-50 bg-ink lg:hidden overflow-y-auto">
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <div className="display text-3xl">Filters</div>
              <button onClick={() => setOpenMobile(false)}><X size={22} /></button>
            </div>
            {Body}
          </div>
        </div>
      )}
    </>
  );
}

type SelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
};

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select
        className="input-field appearance-none cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238B857A' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0 center'
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink text-cream">{o.label}</option>
        ))}
      </select>
    </div>
  );
}
