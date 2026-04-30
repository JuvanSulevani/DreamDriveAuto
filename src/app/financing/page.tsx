'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2, Check, ShieldCheck, Lock } from 'lucide-react';

export default function FinancingPage() {
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
        type: 'financing',
        source: 'financing_page',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        message: `Financing application submitted.`,
        payload: data
      })
    });
    setStep(res.ok ? 'done' : 'err');
  }

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-7xl">
          <div className="md:col-span-5 lg:sticky lg:top-32 self-start">
            <div className="eyebrow text-copper">Pre-Qualification</div>
            <h1 className="display text-6xl md:text-7xl mt-4 leading-[0.95]">
              Financing,<br /><span className="display-italic">simplified.</span>
            </h1>
            <p className="text-ash mt-6 leading-relaxed max-w-md">
              Soft pull only — no impact to your credit score. Pre-qualify in minutes
              and we'll match you with the lender best suited to your file.
            </p>

            <div className="mt-12 space-y-6">
              <Bullet
                icon={<ShieldCheck size={16} className="text-copper" />}
                title="Soft credit inquiry"
                body="No effect on your credit score until you choose to proceed."
              />
              <Bullet
                icon={<Lock size={16} className="text-copper" />}
                title="Bank-grade security"
                body="Application encrypted in transit and at rest. No data resold."
              />
              <Bullet
                icon={<Check size={16} className="text-copper" />}
                title="Multi-lender network"
                body="Bank, credit union, and captive finance options matched to your situation."
              />
            </div>
          </div>

          <div className="md:col-span-7">
            {step === 'done' ? (
              <Done />
            ) : (
              <form onSubmit={submit} className="space-y-12">
                <Section title="Personal Information">
                  <Grid>
                    <Field label="First Name" name="firstName" required />
                    <Field label="Last Name" name="lastName" required />
                    <Field label="Email" name="email" type="email" required />
                    <Field label="Phone" name="phone" type="tel" required />
                    <Field label="Date of Birth" name="dob" type="date" required />
                    <Field label="SSN (last 4)" name="ssn4" maxLength={4} placeholder="••••" />
                  </Grid>
                </Section>

                <Section title="Residence">
                  <Grid>
                    <Field label="Street Address" name="address" required wide />
                    <Field label="City" name="city" required />
                    <Field label="State" name="state" required />
                    <Field label="ZIP" name="zip" required />
                    <Select label="Housing" name="housing" options={[
                      { value: 'own', label: 'Own' },
                      { value: 'rent', label: 'Rent' },
                      { value: 'family', label: 'Living with family' }
                    ]} />
                    <Field label="Monthly Housing Payment" name="rent" type="number" prefix="$" />
                  </Grid>
                </Section>

                <Section title="Employment">
                  <Grid>
                    <Field label="Employer" name="employer" />
                    <Field label="Job Title" name="title" />
                    <Field label="Years at Employer" name="employYears" type="number" />
                    <Field label="Gross Annual Income" name="income" type="number" prefix="$" required />
                  </Grid>
                </Section>

                <Section title="Vehicle Interest">
                  <Grid>
                    <Field label="Stock # or Vehicle (optional)" name="vehicle" wide />
                    <Field label="Down Payment" name="down" type="number" prefix="$" />
                    <Select label="Preferred Term" name="term" options={[
                      { value: '36', label: '36 months' },
                      { value: '48', label: '48 months' },
                      { value: '60', label: '60 months' },
                      { value: '72', label: '72 months' },
                      { value: '84', label: '84 months' }
                    ]} />
                  </Grid>
                </Section>

                <div className="border hairline p-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="consent" required className="mt-1 accent-copper" />
                    <span className="text-xs text-ash leading-relaxed">
                      I authorize Dream Drive Auto and its lending partners to obtain a soft credit inquiry
                      to evaluate pre-qualification offers. I understand this will not impact my credit score
                      until I choose to proceed with a hard inquiry.
                    </span>
                  </label>
                </div>

                {step === 'err' && (
                  <div className="font-mono text-xs text-copper-glow">
                    Submission failed. Please try again or call us directly.
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={step === 'submitting'}>
                  {step === 'submitting' && <Loader2 size={14} className="animate-spin" />}
                  Submit Pre-Qualification
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Bullet({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-9 h-9 border hairline flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <div className="text-cream text-sm font-medium">{title}</div>
        <div className="text-ash text-sm mt-1">{body}</div>
      </div>
    </div>
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

type FieldProps = {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; prefix?: string; maxLength?: number; wide?: boolean;
};
function Field({ label, name, type = 'text', required, placeholder, prefix, maxLength, wide }: FieldProps) {
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <label className="field-label">{label}{required && <span className="text-copper"> *</span>}</label>
      <div className="flex items-baseline gap-2">
        {prefix && <span className="text-ash">{prefix}</span>}
        <input
          className="input-field"
          type={type}
          name={name}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
        />
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
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink">{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Done() {
  return (
    <div className="border hairline p-12 text-center">
      <div className="w-14 h-14 rounded-full bg-copper/15 flex items-center justify-center mx-auto mb-6">
        <Check size={24} className="text-copper" />
      </div>
      <div className="display text-5xl">Submitted.</div>
      <p className="text-ash text-sm mt-4 max-w-md mx-auto leading-relaxed">
        We've received your pre-qualification request. A finance specialist will follow up within one business hour
        with offers from our lender network.
      </p>
    </div>
  );
}
