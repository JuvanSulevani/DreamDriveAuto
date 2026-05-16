'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Car, Users, Radio, Settings, LogOut, Menu, X } from 'lucide-react';

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/inventory', label: 'Inventory', icon: Car },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/syndication', label: 'Syndication', icon: Radio },
  { href: '/admin/settings', label: 'Settings', icon: Settings }
];

export default function AdminNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 border-r hairline bg-ink z-30 flex-col">
        <div className="p-6 border-b hairline">
          <Link href="/" className="block">
            <div className="display text-2xl tracking-tightest leading-none">
              Dream<span className="display-italic text-copper"> Drive</span>
            </div>
            <div className="eyebrow text-[9px] mt-1 text-ash">Admin Console</div>
          </Link>
        </div>

        <nav className="flex-1 py-6">
          {items.map((it) => {
            const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 px-6 py-3 transition-colors text-sm
                  ${active ? 'text-copper border-l-2 border-copper bg-ink-700' : 'text-cream/70 hover:text-cream hover:bg-ink-700/50 border-l-2 border-transparent'}`}
              >
                <it.icon size={16} />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="p-6 border-t hairline flex items-center gap-3 text-ash hover:text-cream transition-colors text-sm"
        >
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      {/* ── Mobile top bar (< lg) ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-ink border-b hairline z-30 flex items-center justify-between px-4">
        <Link href="/" className="block">
          <div className="display text-xl tracking-tightest leading-none">
            Dream<span className="display-italic text-copper"> Drive</span>
          </div>
          <div className="eyebrow text-[8px] mt-0.5 text-ash">Admin</div>
        </Link>
        <button
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="text-cream"
        >
          {drawerOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-ink/95 backdrop-blur flex flex-col pt-14">
          <nav className="flex-1 flex flex-col px-6 py-8 gap-2">
            {items.map((it) => {
              const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-4 py-4 border-b hairline transition-colors text-xl display tracking-tightest
                    ${active ? 'text-copper' : 'text-cream/80 hover:text-cream'}`}
                >
                  <it.icon size={20} />
                  {it.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="p-6 border-t hairline flex items-center gap-3 text-ash hover:text-cream transition-colors text-sm"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </>
  );
}
