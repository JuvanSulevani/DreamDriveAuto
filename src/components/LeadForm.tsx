'use client';

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

type Props = {
  vehicleId?: string;
  source?: string;
  type?: 'contact' | 'test_drive';
  defaultMessage?: string;
  cta?: string;
  dealerName?: string;
};

export default function LeadForm({
  vehicleId, source = 'contact_form', type = 'contact',
  defaultMessage = '', cta = 'Send Message', dealerName = 'Dream Drive Auto'
}: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState(defaultMessage);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    const payload = {
      type,
      vehicleId,
      source,
      firstName: fd.get('firstName'),
      lastName: fd.get('lastName'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      message: fd.get('message')
    };
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setStatus(res.ok ? 'ok' : 'err');
  }

  if (status === 'ok') {
    return (
      <div className="border hairline p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-copper/15 flex items-center justify-center mx-auto mb-4">
          <Check size={20} className="text-copper" />
        </div>
        <div className="display text-3xl">Received.</div>
        <p className="text-ash text-sm mt-3 max-w-sm mx-auto">
          A specialist will reach out within one business hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handle} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="field-label">First Name</label>
          <input className="input-field" name="firstName" required />
        </div>
        <div>
          <label className="field-label">Last Name</label>
          <input className="input-field" name="lastName" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="field-label">Email</label>
          <input type="email" className="input-field" name="email" required />
        </div>
        <div>
          <label className="field-label">Phone</label>
          <input type="tel" className="input-field" name="phone" />
        </div>
      </div>
      <div>
        <label className="field-label">Message</label>
        <textarea
          className="input-field resize-none"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {status === 'err' && (
        <div className="font-mono text-xs text-copper-glow">
          Something went wrong. Please try again or call us directly.
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
        {status === 'submitting' && <Loader2 size={14} className="animate-spin" />}
        {cta}
      </button>

      <p className="font-mono text-[10px] text-ash">
        By submitting, you consent to contact from {dealerName} regarding your inquiry. We never share your information.
      </p>
    </form>
  );
}
