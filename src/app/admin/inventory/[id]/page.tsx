import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import VehicleForm, { VehicleInput } from '@/components/admin/VehicleForm';
import { prisma } from '@/lib/prisma';
import { ensureAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  await ensureAdmin();

  const v = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: { photos: { orderBy: { position: 'asc' } } }
  });
  if (!v) notFound();

  const initial: VehicleInput = {
    id: v.id,
    vin: v.vin,
    stockNumber: v.stockNumber,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim,
    bodyStyle: v.bodyStyle,
    condition: v.condition,
    engine: v.engine,
    transmission: v.transmission,
    drivetrain: v.drivetrain,
    fuelType: v.fuelType,
    cityMpg: v.cityMpg,
    highwayMpg: v.highwayMpg,
    exteriorColor: v.exteriorColor,
    interiorColor: v.interiorColor,
    doors: v.doors,
    seats: v.seats,
    mileage: v.mileage,
    price: v.price,
    msrp: v.msrp,
    status: v.status,
    headline: v.headline,
    description: v.description,
    features: v.features,
    accidentFree: v.accidentFree,
    oneOwner: v.oneOwner,
    serviceRecords: v.serviceRecords,
    carfaxUrl: v.carfaxUrl,
    featured: v.featured,
    photos: v.photos.map((p) => ({ url: p.url, alt: p.alt }))
  };

  return (
    <>
      <Link href="/admin/inventory" className="eyebrow text-ash hover:text-cream inline-flex items-center gap-2 mb-6">
        <ChevronLeft size={14} /> Inventory
      </Link>
      <div className="flex justify-between items-end mb-10">
        <h1 className="display text-5xl">{v.year} {v.make} {v.model}</h1>
        <Link href={`/inventory/${v.slug}`} target="_blank" className="btn-ghost">
          View Public Page
        </Link>
      </div>
      <VehicleForm initial={initial} />
    </>
  );
}
