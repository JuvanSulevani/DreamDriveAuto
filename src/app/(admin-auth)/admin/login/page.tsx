'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Invalid credentials.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-12">
          <div className="display text-3xl tracking-tightest">
            Dream<span className="display-italic text-copper"> Drive</span>
          </div>
          <div className="eyebrow text-[10px] mt-1 text-ash">Admin Console</div>
        </Link>

        <h1 className="display text-5xl mb-2">Sign in.</h1>
        <p className="text-ash text-sm mb-10">Authorized personnel only.</p>

        <form onSubmit={submit} className="space-y-8">
          <div>
            <label className="field-label">Email</label>
            <input type="email" name="email" required className="input-field" />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input type="password" name="password" required className="input-field" />
          </div>

          {error && <div className="font-mono text-xs text-copper-glow">{error}</div>}

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
