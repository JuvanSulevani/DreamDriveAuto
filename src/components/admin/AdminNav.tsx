'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, Users, Radio, Settings, LogOut } from 'lucide-react';

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/inventory', label: 'Inventory', icon: Car },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/syndication', label: 'Syndication', icon: Radio },
  { href: '/admin/settings', label: 'Settings', icon: Settings }
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r hairline bg-ink z-30 flex flex-col">
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
  );
}
