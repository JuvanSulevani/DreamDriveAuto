'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

type Props = {
  makes: string[];
  modelsByMake: Record<string, string[]>;
  yearRange: { min: number; max: number };
};

export default function HeroSearch({ makes, modelsByMake, yearRange }: Props) {
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');

  const years = Array.from(
    { length: yearRange.max - yearRange.min + 1 },
    (_, i) => yearRange.max - i
  );

  const models = make ? (modelsByMake[make] ?? []) : [];

  function handleMakeChange(v: string) {
    setMake(v);
    setModel(''); // reset model when make changes
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('q', model);
    if (yearMin) params.set('yearMin', yearMin);
    if (yearMax) params.set('yearMax', yearMax);
    router.push(`/inventory${params.toString() ? `?${params.toString()}` : ''}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div className="w-full bg-ink-800/95 backdrop-blur-md border border-ink-500">
      {/* Desktop — single horizontal row */}
      <div className="hidden md:grid md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <SearchField label="Make">
          <StyledSelect
            value={make}
            onChange={handleMakeChange}
            placeholder="Any Make"
            onKeyDown={handleKeyDown}
          >
            <option value="">Any Make</option>
            {makes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </StyledSelect>
        </SearchField>

        <SearchField label="Model" divider>
          <StyledSelect
            value={model}
            onChange={setModel}
            placeholder="Any Model"
            disabled={models.length === 0}
            onKeyDown={handleKeyDown}
          >
            <option value="">{make ? 'Any Model' : 'Select make first'}</option>
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </StyledSelect>
        </SearchField>

        <SearchField label="Min Year" divider>
          <StyledSelect
            value={yearMin}
            onChange={setYearMin}
            placeholder="Min Year"
            onKeyDown={handleKeyDown}
          >
            <option value="">Min Year</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </StyledSelect>
        </SearchField>

        <SearchField label="Max Year" divider>
          <StyledSelect
            value={yearMax}
            onChange={setYearMax}
            placeholder="Max Year"
            onKeyDown={handleKeyDown}
          >
            <option value="">Max Year</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </StyledSelect>
        </SearchField>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-3 px-10 bg-copper hover:bg-copper-400 text-cream transition-all duration-300 group border-l border-ink-500 min-w-[160px]"
        >
          <Search size={15} className="transition-transform duration-300 group-hover:scale-110" />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-medium">
            Search
          </span>
        </button>
      </div>

      {/* Mobile — stacked 2×2 + full-width button */}
      <div className="md:hidden">
        <div className="grid grid-cols-2">
          <SearchField label="Make">
            <StyledSelect value={make} onChange={handleMakeChange} placeholder="Any Make">
              <option value="">Any Make</option>
              {makes.map((m) => <option key={m} value={m}>{m}</option>)}
            </StyledSelect>
          </SearchField>

          <SearchField label="Model" divider>
            <StyledSelect
              value={model}
              onChange={setModel}
              placeholder="Any Model"
              disabled={models.length === 0}
            >
              <option value="">{make ? 'Any Model' : '—'}</option>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </StyledSelect>
          </SearchField>

          <SearchField label="Min Year" topDivider>
            <StyledSelect value={yearMin} onChange={setYearMin} placeholder="Min Year">
              <option value="">Min Year</option>
              {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </StyledSelect>
          </SearchField>

          <SearchField label="Max Year" divider topDivider>
            <StyledSelect value={yearMax} onChange={setYearMax} placeholder="Max Year">
              <option value="">Max Year</option>
              {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
            </StyledSelect>
          </SearchField>
        </div>

        <button
          onClick={handleSearch}
          className="w-full flex items-center justify-center gap-3 py-5 bg-copper hover:bg-copper-400 text-cream transition-all duration-300 group border-t border-ink-500"
        >
          <Search size={15} />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase font-medium">
            Search Inventory
          </span>
        </button>
      </div>
    </div>
  );
}

function SearchField({
  label,
  divider = false,
  topDivider = false,
  children
}: {
  label: string;
  divider?: boolean;
  topDivider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        'group relative flex flex-col justify-center px-6 py-5 cursor-pointer',
        'hover:bg-ink-700/40 transition-colors duration-200',
        divider ? 'border-l border-ink-500' : '',
        topDivider ? 'border-t border-ink-500' : ''
      ].join(' ')}
    >
      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-2 select-none">
        {label}
      </span>
      {children}
    </div>
  );
}

function StyledSelect({
  value,
  onChange,
  placeholder,
  disabled = false,
  onKeyDown,
  children
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={[
          'w-full appearance-none bg-transparent pr-6',
          'font-sans text-sm leading-tight',
          'focus:outline-none cursor-pointer',
          'transition-colors duration-200',
          disabled ? 'text-ash/50 cursor-default' : value ? 'text-cream' : 'text-cream/60',
        ].join(' ')}
      >
        {children}
      </select>
      {/* Custom chevron */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke={disabled ? '#4a4740' : '#8B857A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
