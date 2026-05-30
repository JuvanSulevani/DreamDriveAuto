import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InventoryBrowser, { type ListingVehicle } from '@/components/InventoryBrowser';
import { prisma } from '@/lib/prisma';
import { safePublicQuery } from '@/lib/public-query';
import { readSnapshot, reviveVehicle, type SnapshotVehicle } from '@/lib/snapshot';

// Prerendered (ISR). The page no longer reads searchParams, so it can be
// statically generated at build time and revalidated every 5 min in the
// background. Filtering/sorting moved client-side (see InventoryBrowser),
// which makes /inventory Aurora-independent for visitors.
export const revalidate = 300;

export default async function InventoryPage() {
  const vehicles = await safePublicQuery(
    'inventory.list',
    async () => {
      const rows = await prisma.vehicle.findMany({
        where: { status: 'available' },
        include: { photos: { orderBy: { position: 'asc' } } },
        orderBy: { createdAt: 'desc' }
      });
      return rows.map(toListingVehicle);
    },
    [],
    async () => {
      // DB paused during a background revalidation — fall back to the snapshot.
      const snap = await readSnapshot();
      if (!snap) return null;
      return snap.vehicles
        .filter((v) => v.status === 'available')
        .map(reviveVehicle)
        .map(toListingVehicle);
    }
  );

  const makes = uniqueSorted(vehicles.map((v) => v.make));
  const bodyStyles = uniqueSorted(vehicles.map((v) => v.bodyStyle));

  return (
    <>
      <Header />
      <main className="pt-32 px-6 lg:px-12 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 items-end">
          <div className="md:col-span-8">
            <div className="eyebrow">The Catalogue</div>
            <h1 className="display text-6xl md:text-8xl mt-4 leading-[0.92]">
              Inventory.
            </h1>
          </div>
          <div className="md:col-span-4 md:text-right">
            <div className="display text-3xl tabular">
              {vehicles.length} <span className="text-ash text-base font-sans tracking-normal">currently available</span>
            </div>
          </div>
        </div>

        <Suspense fallback={<InventorySkeleton />}>
          <InventoryBrowser vehicles={vehicles} makes={makes} bodyStyles={bodyStyles} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

// Rendered into the static HTML while the client-filtered grid hydrates.
// useSearchParams (in InventoryBrowser/InventoryFilters) forces that subtree
// to client-render, so a Suspense boundary is required for the ISR build.
function InventorySkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-3" />
      <div className="lg:col-span-9">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] bg-ink-700 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function toListingVehicle(v: SnapshotVehicle): ListingVehicle {
  return {
    id: v.id,
    slug: v.slug,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    bodyStyle: v.bodyStyle,
    condition: v.condition,
    mileage: v.mileage,
    price: v.price,
    exteriorColor: v.exteriorColor,
    drivetrain: v.drivetrain,
    transmission: v.transmission,
    engine: v.engine,
    vin: v.vin,
    stockNumber: v.stockNumber,
    createdAt: v.createdAt.getTime(),
    photos: v.photos.map((p) => ({ url: p.url, alt: p.alt }))
  };
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}
