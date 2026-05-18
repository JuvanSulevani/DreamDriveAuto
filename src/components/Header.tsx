'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { useSiteSettings } from '@/lib/use-site-settings';

type NavItem = { href: string; label: string; visibilityKey?: 'financingVisible' | 'tradeInVisible' | 'sellVisible' | 'serviceVisible' | 'aboutVisible' };

const NAV: NavItem[] = [
  { href: '/inventory', label: 'Inventory' },
  { href: '/financing', label: 'Financing', visibilityKey: 'financingVisible' },
  { href: '/trade-in', label: 'Trade-In', visibilityKey: 'tradeInVisible' },
  { href: '/sell', label: 'Sell Yours', visibilityKey: 'sellVisible' },
  { href: '/service', label: 'Service', visibilityKey: 'serviceVisible' },
  { href: '/about', label: 'About', visibilityKey: 'aboutVisible' },
  { href: '/contact', label: 'Contact' }
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { dealer, pages } = useSiteSettings();
  const visibleNav = NAV.filter((n) => !n.visibilityKey || pages[n.visibilityKey]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-ink border-b hairline' : 'bg-gradient-to-b from-ink/80 via-ink/10 to-transparent'
      }`}
    >
      <div className="px-6 lg:px-12 h-20 flex items-center justify-between gap-6">
        {/* Wordmark */}
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className="display text-2xl tracking-tightest leading-none">
              Dream<span className="display-italic text-copper"> Drive</span>
            </div>
            <div className="eyebrow text-[9px] mt-0.5 text-ash">Auto · Est. 2025</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {visibleNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="eyebrow text-[10.5px] text-cream/70 hover:text-cream transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <a href={`tel:${dealer.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2 group">
            <Phone size={14} className="text-copper" />
            <span className="font-mono text-xs text-cream/80 group-hover:text-cream transition-colors">
              {dealer.phone}
            </span>
          </a>
          <Link href="/inventory" className="btn-primary">
            View Inventory
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Menu"
          onClick={() => setOpen(!open)}
          className="lg:hidden text-cream"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t hairline bg-ink/95 backdrop-blur-md">
          <nav className="flex flex-col px-6 py-8 gap-6">
            {visibleNav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="display text-3xl tracking-tightest hover:text-copper transition-colors"
              >
                {n.label}
              </Link>
            ))}
            <a
              href={`tel:${dealer.phone.replace(/[^0-9+]/g, '')}`}
              className="mt-4 font-mono text-xs text-ash"
            >
              {dealer.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
