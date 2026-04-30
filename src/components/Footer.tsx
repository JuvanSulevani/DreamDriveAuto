import Link from 'next/link';
import { DEALER } from '@/lib/dealer';

export default function Footer() {
  return (
    <footer className="border-t hairline mt-32">
      <div className="px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="display text-5xl md:text-6xl tracking-tightest leading-none">
              Dream<br />
              <span className="display-italic text-copper">Drive Auto.</span>
            </div>
            <p className="mt-6 text-ash text-sm max-w-md leading-relaxed">
              A boutique showroom for vehicles worth keeping. Seattle, by appointment.
              No pressure. No haggling. Just well-sourced cars.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="eyebrow mb-6">Showroom</div>
            <div className="text-cream text-sm space-y-2">
              <div>{DEALER.address}</div>
              <a className="block hover:text-copper" href={`tel:${DEALER.phone.replace(/[^0-9+]/g, '')}`}>
                {DEALER.phone}
              </a>
            </div>
            <div className="eyebrow mt-8 mb-3">Hours</div>
            {DEALER.hours.map((h) => (
              <div key={h.day} className="flex justify-between font-mono text-xs text-ash py-1">
                <span>{h.day}</span>
                <span>{h.open} — {h.close}</span>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            <div className="eyebrow mb-6">Inventory</div>
            <ul className="space-y-3 text-sm">
              <li><Link className="hover:text-copper" href="/inventory">All Vehicles</Link></li>
              <li><Link className="hover:text-copper" href="/inventory?condition=new">New</Link></li>
              <li><Link className="hover:text-copper" href="/inventory?condition=certified">Certified</Link></li>
              <li><Link className="hover:text-copper" href="/inventory?condition=used">Pre-Owned</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <div className="eyebrow mb-6">Services</div>
            <ul className="space-y-3 text-sm">
              <li><Link className="hover:text-copper" href="/financing">Financing</Link></li>
              <li><Link className="hover:text-copper" href="/trade-in">Trade Appraisal</Link></li>
              <li><Link className="hover:text-copper" href="/sell">Sell Your Car</Link></li>
              <li><Link className="hover:text-copper" href="/service">Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t hairline mt-20 pt-8 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="font-mono text-[11px] text-ash">
            © {new Date().getFullYear()} {DEALER.name}. All rights reserved.
          </div>
          <div className="font-mono text-[11px] text-ash flex gap-8">
            <Link href="/privacy" className="hover:text-cream">Privacy</Link>
            <Link href="/terms" className="hover:text-cream">Terms</Link>
            <Link href="/admin" className="hover:text-cream">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
