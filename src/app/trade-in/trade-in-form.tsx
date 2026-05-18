'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, Check } from 'lucide-react';

export default function TradeInForm() {
  const [step, setStep] = useState<'form' | 'submitting' | 'done' | 'err'>('form');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep('submitting');
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'trade_in',
        source: 'trade_in_page',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        message: `Trade-in appraisal request: ${data.year} ${data.make} ${data.model}`,
        payload: data
      })
    });
    setStep(res.ok ? 'done' : 'err');
  }

  if (step === 'done') {
    return (
      <>
        <Header />
        <main className="pt-32 pb-24 px-6 lg:px-12">
          <div className="max-w-2xl mx-auto border hairline p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-copper/15 flex items-center justify-center mx-auto mb-6">
              <Check size={24} className="text-copper" />
            </div>
            <div className="display text-5xl">Appraisal Requested.</div>
            <p className="text-ash text-sm mt-4 max-w-md mx-auto leading-relaxed">
              Expect a written valuation in your inbox within 24 hours. If we need additional photos,
              we'll be in touch first.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-7xl">
          <div className="md:col-span-5 lg:sticky lg:top-32 self-start">
            <div className="eyebrow text-copper">Trade Appraisal</div>
            <h1 className="display text-6xl md:text-7xl mt-4 leading-[0.95]">
              Honest<br /><span className="display-italic">numbers.</span>
            </h1>
            <p className="text-ash mt-6 leading-relaxed max-w-md">
              Tell us about your car. We'll quote a transparent trade value within 24 hours,
              broken out line-by-line so you can see exactly how we arrived at the number.
            </p>
            <div className="mt-12 space-y-2 text-sm text-ash font-mono">
              <div>· Black book + market-anchored</div>
              <div>· No obligation</div>
              <div>· Honored for 7 days</div>
            </div>
          </div>

          <form onSubmit={submit} className="md:col-span-7 space-y-12">
            <Section title="Your Vehicle">
              <Grid>
                <Field label="VIN" name="vin" wide placeholder="17 characters" />
                <Field label="Year" name="year" type="number" required />
                <Field label="Make" name="make" required />
                <Field label="Model" name="model" required />
                <Field label="Trim / Style" name="trim" />
                <Field label="Mileage" name="mileage" type="number" required />
                <Field label="Exterior Color" name="exteriorColor" />
                <Field label="Interior Color" name="interiorColor" />
              </Grid>
            </Section>

            <Section title="Condition">
              <Grid>
                <Select label="Overall" name="condition" options={[
                  { value: 'excellent', label: 'Excellent' },
                  { value: 'good', label: 'Good' },
                  { value: 'fair', label: 'Fair' },
                  { value: 'poor', label: 'Poor' }
                ]} />
                <Select label="Accident History" name="accidents" options={[
                  { value: 'none', label: 'None' },
                  { value: 'minor', label: 'Minor (cosmetic)' },
                  { value: 'major', label: 'Major' }
                ]} />
                <Select label="Title" name="title" options={[
                  { value: 'clean', label: 'Clean' },
                  { value: 'salvage', label: 'Salvage' },
                  { value: 'rebuilt', label: 'Rebuilt' }
                ]} />
                <Field label="Outstanding Loan Balance" name="loanBalance" type="number" prefix="$" />
              </Grid>
              <div className="mt-6">
                <label className="field-label">Notes (modifications, recent service, known issues)</label>
                <textarea name="notes" className="input-field resize-none" rows={4} />
              </div>
            </Section>

            <Section title="You">
              <Grid>
                <Field label="First Name" name="firstName" required />
                <Field label="Last Name" name="lastName" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" required />
              </Grid>
            </Section>

            {step === 'err' && (
              <div className="font-mono text-xs text-copper-glow">
                Submission failed. Please try again.
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={step === 'submitting'}>
              {step === 'submitting' && <Loader2 size={14} className="animate-spin" />}
              Request Appraisal
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-8 pb-4 border-b hairline">{title}</div>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">{children}</div>;
}
type FProps = { label: string; name: string; type?: string; required?: boolean; placeholder?: string; prefix?: string; wide?: boolean };
function Field({ label, name, type = 'text', required, placeholder, prefix, wide }: FProps) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <label className="field-label">{label}{required && <span className="text-copper"> *</span>}</label>
      <div className="flex items-baseline gap-2">
        {prefix && <span className="text-ash">{prefix}</span>}
        <input className="input-field" type={type} name={name} required={required} placeholder={placeholder} />
      </div>
    </div>
  );
}
function Select({ label, name, options }: { label: string; name: string; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select name={name} className="input-field" defaultValue="">
        <option value="" className="bg-ink">Select…</option>
        {options.map((o) => <option key={o.value} value={o.value} className="bg-ink">{o.label}</option>)}
      </select>
    </div>
  );
}
