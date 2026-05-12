import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VehicleCard from '@/components/VehicleCard';
import InventoryFilters from '@/components/InventoryFilters';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

type SearchParams = {
  q?: string; make?: string; bodyStyle?: string; condition?: string;
  priceMin?: string; priceMax?: string; yearMin?: string; yearMax?: string;
  sort?: string;
};

export default async function InventoryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const where: Prisma.VehicleWhereInput = { status: 'available' };

  if (params.q) {
    const q = params.q;
    where.OR = [
      { make: { contains: q } }, { model: { contains: q } },
      { trim: { contains: q } }, { vin: { contains: q } },
      { stockNumber: { contains: q } }
    ];
  }
  if (params.make) where.make = params.make;
  if (params.bodyStyle) where.bodyStyle = params.bodyStyle;
  if (params.condition) where.condition = params.condition;

  if (params.priceMin || params.priceMax) {
    where.price = {};
    if (params.priceMin) where.price.gte = Math.round(Number(params.priceMin) * 100);
    if (params.priceMax) where.price.lte = Math.round(Number(params.priceMax) * 100);
  }
  if (params.yearMin || params.yearMax) {
    where.year = {};
    if (params.yearMin) where.year.gte = Number(params.yearMin);
    if (params.yearMax) where.year.lte = Number(params.yearMax);
  }

  const orderBy: Prisma.VehicleOrderByWithRelationInput =
    params.sort === 'price_asc' ? { price: 'asc' }
    : params.sort === 'price_desc' ? { price: 'desc' }
    : params.sort === 'mileage_asc' ? { mileage: 'asc' }
    : params.sort === 'year_desc' ? { year: 'desc' }
    : { createdAt: 'desc' };

  const [vehicles, total, makes, bodyStyles] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { photos: { orderBy: { position: 'asc' } } },
      orderBy
    }),
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where: { status: 'available' },
      distinct: ['make'], select: { make: true }, orderBy: { make: 'asc' }
    }),
    prisma.vehicle.findMany({
      where: { status: 'available' },
      distinct: ['bodyStyle'], select: { bodyStyle: true }, orderBy: { bodyStyle: 'asc' }
    })
  ]);

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
              {total} <span className="text-ash text-base font-sans tracking-normal">currently available</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3">
            <InventoryFilters
              makes={makes.map((m) => m.make)}
              bodyStyles={bodyStyles.map((b) => b.bodyStyle)}
            />
          </div>

          <div className="lg:col-span-9">
            {vehicles.length === 0 ? (
              <div className="border hairline p-16 text-center">
                <div className="display text-4xl">No matches.</div>
                <p className="text-ash mt-4">Try widening your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                {vehicles.map((v, i) => <VehicleCard key={v.id} v={v} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
