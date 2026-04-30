'use client';

import { useMemo, useState } from 'react';
import { computePayment } from '@/lib/finance';
import { formatPrice } from '@/lib/format';

export default function FinanceCalculator({ priceCents }: { priceCents: number }) {
  const [down, setDown] = useState(Math.round(priceCents * 0.15) / 100); // dollars
  const [trade, setTrade] = useState(0);
  const [term, setTerm] = useState(60);
  const [apr, setApr] = useState(7.4);

  const result = useMemo(() => computePayment({
    priceCents,
    downCents: Math.round(down * 100),
    tradeCents: Math.round(trade * 100),
    termMonths: term,
    aprPercent: apr,
    taxRate: 0.085
  }), [priceCents, down, trade, term, apr]);

  return (
    <div className="border hairline">
      <div className="px-6 py-5 border-b hairline flex items-baseline justify-between">
        <div className="eyebrow">Estimated Payment</div>
        <div className="font-mono text-[10px] text-ash">incl. 8.5% tax</div>
      </div>

      <div className="px-6 py-8 text-center border-b hairline">
        <div className="display text-6xl tracking-tightest tabular leading-none">
          {formatPrice(result.monthlyCents)}
        </div>
        <div className="eyebrow mt-3 text-ash">per month / {term} mo</div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Slider label="Down Payment" value={down} setValue={setDown} min={0} max={priceCents / 100} step={500} suffix="" prefix="$" />
        <Slider label="Trade-In Value" value={trade} setValue={setTrade} min={0} max={priceCents / 100} step={500} suffix="" prefix="$" />

        <div>
          <div className="flex justify-between mb-2">
            <span className="field-label">Term</span>
            <span className="font-mono text-xs text-cream">{term} months</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[36, 48, 60, 72, 84].map((t) => (
              <button
                key={t}
                onClick={() => setTerm(t)}
                className={`py-2 font-mono text-[11px] border ${
                  term === t ? 'bg-copper border-copper text-cream' : 'border-ink-500 text-ash hover:border-cream/30'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="field-label">APR</span>
            <span className="font-mono text-xs text-cream">{apr.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min="2"
            max="14"
            step="0.1"
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            className="w-full accent-copper"
          />
        </div>
      </div>

      <div className="px-6 py-5 border-t hairline grid grid-cols-2 gap-4">
        <div>
          <div className="spec-label">Financed</div>
          <div className="spec-value tabular mt-1">{formatPrice(result.amountFinancedCents)}</div>
        </div>
        <div>
          <div className="spec-label">Total Interest</div>
          <div className="spec-value tabular mt-1">{formatPrice(result.totalInterestCents)}</div>
        </div>
      </div>

      <p className="px-6 py-4 font-mono text-[10px] text-ash leading-relaxed border-t hairline">
        Estimate only. Actual rates and terms subject to credit approval. Tax rates vary by jurisdiction.
      </p>
    </div>
  );
}

type SliderProps = {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
};
function Slider({ label, value, setValue, min, max, step, prefix = '', suffix = '' }: SliderProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="field-label">{label}</span>
        <span className="font-mono text-xs text-cream tabular">
          {prefix}{Math.round(value).toLocaleString()}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-copper"
      />
    </div>
  );
}
