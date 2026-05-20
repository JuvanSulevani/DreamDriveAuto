import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VehicleGallery from '@/components/VehicleGallery';
import FinanceCalculator from '@/components/FinanceCalculator';
import LeadForm from '@/components/LeadForm';
import VehicleCard from '@/components/VehicleCard';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatMiles, conditionLabel } from '@/lib/format';
import { DEALER } from '@/lib/dealer';
import { getSiteSettings } from '@/lib/site-settings-store';
import { safePublicQuery } from '@/lib/public-query';
import { readSnapshot, reviveVehicle } from '@/lib/snapshot';
import { Phone, MapPin, ShieldCheck, FileText, ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await safePublicQuery(
    'vehicle.metadata',
    () => prisma.vehicle.findUnique({ where: { slug } }),
    null,
    async () => {
      const snap = await readSnapshot();
      const match = snap?.vehicles.find((x) => x.slug === slug);
      return match ? reviveVehicle(match) : null;
    }
  );
  if (!v) return { title: 'Vehicle not found' };
  return {
    title: `${v.year} ${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''}`,
    description: v.headline || `${v.year} ${v.make} ${v.model} for sale at ${DEALER.name}.`
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { dealer } = await getSiteSettings();
  const v = await safePublicQuery(
    'vehicle.detail',
    () => prisma.vehicle.findUnique({
      where: { slug },
      include: { photos: { orderBy: { position: 'asc' } } }
    }),
    null,
    async () => {
      // DB paused — pull the vehicle (with its photos) from the snapshot.
      const snap = await readSnapshot();
      const match = snap?.vehicles.find((x) => x.slug === slug);
      return match ? reviveVehicle(match) : null;
    }
  );

  if (!v || v.status === 'hidden') notFound();

  const similar = await safePublicQuery(
    'vehicle.similar',
    () => prisma.vehicle.findMany({
      where: {
        status: 'available',
        bodyStyle: v.bodyStyle,
        NOT: { id: v.id }
      },
      include: { photos: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 4
    }),
    [],
    async () => {
      // If the detail call fell back to the snapshot, this almost certainly
      // will too — keep the "Adjacent" rail populated instead of empty.
      const snap = await readSnapshot();
      if (!snap) return null;
      return snap.vehicles
        .filter((x) => x.status === 'available' && x.bodyStyle === v.bodyStyle && x.id !== v.id)
        .slice(0, 4)
        .map(reviveVehicle);
    }
  );

  const features = (v.features || '').split(',').map((s) => s.trim()).filter(Boolean);
  const savings = v.msrp ? v.msrp - v.price : 0;

  return (
    <>
      <Header />

      <main className="pt-28 pb-24">
        {/* Breadcrumb */}
        <div className="px-6 lg:px-12 pb-6">
          <Link href="/inventory" className="eyebrow text-ash hover:text-cream inline-flex items-center gap-2">
            <ChevronLeft size={14} /> Back to Inventory
          </Link>
        </div>

        {/* Title + price strip */}
        <div className="px-6 lg:px-12 pb-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="eyebrow text-copper">{conditionLabel(v.condition)}</div>
            <h1 className="display text-5xl md:text-7xl mt-3 leading-[0.92] tracking-tightest">
              {v.year} {v.make} {v.model}
              {v.trim && <span className="display-italic text-copper"> {v.trim}</span>}
            </h1>
            {v.headline && (
              <p className="display-italic text-2xl text-ash mt-4 max-w-3xl">{v.headline}</p>
            )}
          </div>
          <div className="md:col-span-4 md:text-right">
            <div className="display text-5xl tabular">{formatPrice(v.price)}</div>
            {v.msrp && savings > 0 && (
              <div className="font-mono text-xs text-ash mt-2">
                <span className="line-through">{formatPrice(v.msrp)}</span>
                <span className="text-copper ml-3">Save {formatPrice(savings)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="px-6 lg:px-12">
          <VehicleGallery photos={v.photos.map((p) => ({ url: p.url, alt: p.alt }))} />
        </div>

        {/* Quick spec strip */}
        <div className="px-6 lg:px-12 mt-12 border-y hairline">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-ink-500">
            <Quick label="Mileage" value={formatMiles(v.mileage)} />
            <Quick label="Drive" value={v.drivetrain || '—'} />
            <Quick label="Engine" value={v.engine || '—'} />
            <Quick label="Trans" value={v.transmission || '—'} />
            <Quick label="Exterior" value={v.exteriorColor || '—'} />
            <Quick label="Stock" value={v.stockNumber} />
          </div>
        </div>

        {/* Detail body */}
        <div className="px-6 lg:px-12 pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT — content */}
          <div className="lg:col-span-8 space-y-20">
            {/* Description */}
            {v.description && (
              <section>
                <div className="eyebrow mb-6">001 · The Story</div>
                <p className="text-cream/85 text-lg leading-relaxed max-w-3xl">{v.description}</p>
              </section>
            )}

            {/* Specifications — watchmaker spec sheet */}
            <section>
              <div className="eyebrow mb-8">002 · Specifications</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                <SpecRow label="Year" value={String(v.year)} />
                <SpecRow label="Make" value={v.make} />
                <SpecRow label="Model" value={v.model} />
                <SpecRow label="Trim" value={v.trim || '—'} />
                <SpecRow label="Body Style" value={v.bodyStyle} />
                <SpecRow label="Condition" value={conditionLabel(v.condition)} />
                <SpecRow label="VIN" value={v.vin} mono />
                <SpecRow label="Stock Number" value={v.stockNumber} mono />
                <SpecRow label="Mileage" value={formatMiles(v.mileage)} />
                <SpecRow label="Engine" value={v.engine || '—'} />
                <SpecRow label="Transmission" value={v.transmission || '—'} />
                <SpecRow label="Drivetrain" value={v.drivetrain || '—'} />
                <SpecRow label="Fuel" value={v.fuelType || '—'} />
                <SpecRow
                  label="Fuel economy"
                  value={v.cityMpg && v.highwayMpg ? `${v.cityMpg} / ${v.highwayMpg} L/100km` : '—'}
                />
                <SpecRow label="Exterior Color" value={v.exteriorColor || '—'} />
                <SpecRow label="Interior" value={v.interiorColor || '—'} />
                <SpecRow label="Doors" value={v.doors ? String(v.doors) : '—'} />
                <SpecRow label="Seats" value={v.seats ? String(v.seats) : '—'} />
              </div>
            </section>

            {/* Features */}
            {features.length > 0 && (
              <section>
                <div className="eyebrow mb-8">003 · Equipment</div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-baseline gap-3 py-2 border-b hairline">
                      <span className="display-italic text-copper">·</span>
                      <span className="text-cream/90 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* History */}
            <section>
              <div className="eyebrow mb-8">004 · History & Provenance</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-500">
                <HistoryCell
                  active={v.accidentFree}
                  title="Accident-Free"
                  body={v.accidentFree ? 'No reported damage.' : 'Damage reported.'}
                />
                <HistoryCell
                  active={v.oneOwner}
                  title="One-Owner"
                  body={v.oneOwner ? 'Single owner from new.' : 'Multiple prior owners.'}
                />
                <HistoryCell
                  active={v.serviceRecords}
                  title="Service Records"
                  body={v.serviceRecords ? 'Documented service history.' : 'Records limited.'}
                />
              </div>
              {v.carfaxUrl && (
                <a
                  href={v.carfaxUrl} target="_blank" rel="noreferrer"
                  className="btn-ghost mt-8"
                >
                  <FileText size={14} /> View CarFax Report
                </a>
              )}
            </section>

            {/* Inquire */}
            <section className="border hairline p-8 md:p-12">
              <div className="eyebrow mb-3">005 · Inquire</div>
              <h3 className="display text-4xl md:text-5xl">
                Interested in this <span className="display-italic">{v.make}?</span>
              </h3>
              <p className="text-ash text-sm mt-4 max-w-lg">
                A specialist will respond within one business hour with availability,
                additional photos, or to schedule a private viewing.
              </p>
              <div className="mt-10">
                <LeadForm
                  vehicleId={v.id}
                  source="vehicle_detail"
                  defaultMessage={`I'd like more information on the ${v.year} ${v.make} ${v.model} (Stock ${v.stockNumber}).`}
                  cta="Send Inquiry"
                  dealerName={dealer.name}
                />
              </div>
            </section>
          </div>

          {/* RIGHT — sticky sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 self-start">
            <FinanceCalculator priceCents={v.price} />

            <div className="border hairline p-6">
              <div className="eyebrow mb-5">Showroom</div>
              <a href={`tel:${dealer.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-3 group mb-3">
                <Phone size={14} className="text-copper" />
                <span className="text-cream group-hover:text-copper transition-colors">{dealer.phone}</span>
              </a>
              <div className="flex items-start gap-3 text-cream text-sm">
                <MapPin size={14} className="text-copper mt-1 shrink-0" />
                {dealer.address}
              </div>
              <Link href="/contact" className="btn-ghost w-full justify-center mt-6">
                Book a Test Drive
              </Link>
            </div>

            <div className="border hairline p-6">
              <ShieldCheck size={20} className="text-copper" />
              <div className="display text-2xl mt-4">Buy with Assurance.</div>
              <p className="text-ash text-sm mt-3 leading-relaxed">
                Every vehicle inspected by an independent certified technician.
                7-day return policy on every car we sell.
              </p>
            </div>
          </aside>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="px-6 lg:px-12 mt-32">
            <div className="eyebrow mb-3">006 · Adjacent</div>
            <h3 className="display text-4xl md:text-5xl mb-12">You may also consider.</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {similar.map((s, i) => <VehicleCard key={s.id} v={s} index={i} />)}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

function Quick({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink p-5">
      <div className="spec-label">{label}</div>
      <div className="spec-value mt-1.5 truncate">{value}</div>
    </div>
  );
}

function SpecRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-baseline py-3.5 border-b hairline">
      <span className="spec-label">{label}</span>
      <span className={`text-sm text-cream ${mono ? 'font-mono text-xs' : ''} text-right`}>{value}</span>
    </div>
  );
}

function HistoryCell({ active, title, body }: { active: boolean; title: string; body: string }) {
  return (
    <div className={`bg-ink p-6 ${active ? '' : 'opacity-60'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-copper' : 'bg-ash/40'}`} />
        <div className="spec-label">{title}</div>
      </div>
      <div className="display text-2xl">{active ? 'Yes' : 'No'}</div>
      <p className="text-ash text-xs mt-2">{body}</p>
    </div>
  );
}
