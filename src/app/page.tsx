import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VehicleCard from '@/components/VehicleCard';
import Ticker from '@/components/Ticker';
import { prisma } from '@/lib/prisma';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const featured = await prisma.vehicle.findMany({
    where: { status: 'available', featured: true },
    include: { photos: { orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 4
  });

  const recent = await prisma.vehicle.findMany({
    where: { status: 'available' },
    include: { photos: { orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 8
  });

  const heroVehicle = featured[0] ?? recent[0];
  const heroPhoto = heroVehicle?.photos[0]?.url;

  const totalCount = await prisma.vehicle.count({ where: { status: 'available' } });

  const makes = Array.from(new Set(recent.map((r) => r.make))).slice(0, 8);

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="relative h-screen min-h-[760px] overflow-hidden">
        {heroPhoto && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={heroPhoto}
            alt=""
            className="absolute inset-0 w-full h-full object-cover pan-image"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-transparent to-transparent" />

        <div className="relative h-full flex flex-col justify-end px-6 lg:px-12 pb-20 lg:pb-28">
          <div className="reveal max-w-6xl">
            <div className="eyebrow">Volume 01 · Spring 2025 Catalogue</div>

            <h1 className="display text-[15vw] md:text-[10vw] lg:text-[9rem] mt-6 leading-[0.85]">
              Cars worth<br />
              <span className="display-italic text-copper">keeping.</span>
            </h1>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-8 max-w-5xl">
              <p className="md:col-span-6 text-cream/80 text-base leading-relaxed">
                A curated showroom of meticulously sourced performance, luxury, and pre-owned vehicles.
                Every car inspected. Every story documented. No pressure. No haggling.
              </p>
              <div className="md:col-span-4 md:col-start-9 flex md:flex-col gap-4 md:items-end md:text-right">
                <div>
                  <div className="display tabular text-5xl">{totalCount}</div>
                  <div className="eyebrow text-ash mt-2">Vehicles in stock</div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <Link href="/inventory" className="btn-primary">
                Browse Inventory <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="btn-ghost">
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>

        {heroVehicle && (
          <div className="absolute right-6 lg:right-12 bottom-20 lg:bottom-28 hidden md:block">
            <Link href={`/inventory/${heroVehicle.slug}`} className="group flex flex-col items-end gap-2">
              <div className="eyebrow text-ash">Currently Featured</div>
              <div className="display-italic text-2xl text-cream group-hover:text-copper transition-colors">
                {heroVehicle.year} {heroVehicle.make} {heroVehicle.model}
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] tracking-ticker text-cream/60 group-hover:text-cream transition-colors">
                View this vehicle <ArrowUpRight size={12} />
              </div>
            </Link>
          </div>
        )}
      </section>

      {/* TICKER */}
      <Ticker
        items={[
          'Boutique sourcing',
          'CarFax verified',
          'Mechanical pre-purchase inspection',
          'Photographed by appointment',
          'Trade-in welcomed',
          'Nationwide delivery',
          'Authorized service partners',
          'No haggle policy',
          ...makes.map((m) => `${m} specialists`)
        ]}
      />

      {/* FEATURED COLLECTION */}
      <section className="px-6 lg:px-12 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12 items-end">
          <div className="md:col-span-6">
            <div className="eyebrow">001 · The Selection</div>
            <h2 className="display text-6xl md:text-8xl mt-4 leading-[0.9]">
              This week's <span className="display-italic text-copper">favorites.</span>
            </h2>
          </div>
          <div className="md:col-span-4 md:col-start-9 md:text-right">
            <p className="text-ash text-sm leading-relaxed">
              A small selection of cars in current rotation — chosen for their condition,
              specification, and the stories they carry.
            </p>
            <Link href="/inventory" className="btn-ghost mt-6">
              All Inventory <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {featured.map((v, i) => (
            <VehicleCard key={v.id} v={v} index={i} />
          ))}
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="px-6 lg:px-12 py-32 border-t hairline mt-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-3">
            <div className="eyebrow">002 · Philosophy</div>
          </div>
          <div className="md:col-span-9">
            <h3 className="display text-4xl md:text-6xl leading-[1.05] tracking-tightest">
              We sell cars the way <span className="display-italic">we'd want to buy them</span> — each vetted on its merits,
              priced honestly, presented thoroughly. No back-room games.
              No surprise add-ons. No finance product you didn't ask for.
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
              <Pillar
                num="01"
                title="Vetted in person"
                body="Every vehicle inspected by an independent certified technician before it joins our floor. Reports go in your file."
              />
              <Pillar
                num="02"
                title="Documented history"
                body="CarFax and AutoCheck on every car. Service records traced where available. We tell you what we know and what we don't."
              />
              <Pillar
                num="03"
                title="Transparent pricing"
                body="Market-anchored. No haggling required. Trade values explained line-by-line. Financing without the four-square shuffle."
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES STRIP */}
      <section className="px-6 lg:px-12 py-24 border-t hairline">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink-500">
          <ServiceCard href="/financing" title="Financing" body="Pre-approval in minutes. Multi-lender."  />
          <ServiceCard href="/trade-in" title="Trade-In" body="Honest appraisal in 24 hours." />
          <ServiceCard href="/sell" title="Sell Yours" body="We buy outright. Cash offers." />
          <ServiceCard href="/service" title="Service" body="Authorized partners, factory parts." />
        </div>
      </section>

      {/* RECENT ADDITIONS */}
      <section className="px-6 lg:px-12 pt-32 pb-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="eyebrow">003 · New to the Floor</div>
            <h2 className="display text-5xl md:text-7xl mt-4">Just arrived.</h2>
          </div>
          <Link href="/inventory" className="hidden md:flex eyebrow text-cream/70 hover:text-cream items-center gap-2">
            All inventory <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {recent.slice(0, 8).map((v, i) => (
            <VehicleCard key={v.id} v={v} index={i} />
          ))}
        </div>
      </section>

      {/* APPOINTMENT */}
      <section className="px-6 lg:px-12 py-32 mt-20 border-t hairline">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <div className="eyebrow">004 · By Appointment</div>
            <h3 className="display text-5xl md:text-7xl mt-4 leading-[0.95]">
              Visit the<br /><span className="display-italic text-copper">showroom.</span>
            </h3>
            <p className="text-ash mt-6 max-w-lg leading-relaxed">
              Our floor is shown by appointment so we can give every guest unhurried attention.
              Coffee will be ready. The car you're interested in will be detailed and waiting.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="border hairline p-8">
              <div className="eyebrow mb-6">Showroom Hours</div>
              <div className="space-y-3">
                <Hours day="Monday — Friday" hours="9:00 — 19:00" />
                <Hours day="Saturday" hours="10:00 — 18:00" />
                <Hours day="Sunday" hours="11:00 — 16:00" />
              </div>
              <Link href="/contact" className="btn-primary w-full justify-center mt-8">
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Pillar({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] tracking-ticker text-copper">{num}</div>
      <h4 className="display text-3xl mt-3">{title}</h4>
      <p className="text-ash text-sm mt-4 leading-relaxed">{body}</p>
    </div>
  );
}

function ServiceCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="bg-ink hover:bg-ink-700 transition-colors p-10 group flex flex-col gap-6"
    >
      <div className="eyebrow">{title}</div>
      <div className="display text-3xl flex justify-between items-end">
        {title}
        <ArrowUpRight
          size={20}
          className="text-ash group-hover:text-copper group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
        />
      </div>
      <p className="text-ash text-sm">{body}</p>
    </Link>
  );
}

function Hours({ day, hours }: { day: string; hours: string }) {
  return (
    <div className="flex justify-between font-mono text-xs">
      <span className="text-ash">{day}</span>
      <span className="text-cream tabular">{hours}</span>
    </div>
  );
}
