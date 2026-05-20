import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { slugify } from '@/lib/format';
import { parseVehicleInput } from '@/lib/vehicle-validation';
import { writeSnapshot } from '@/lib/snapshot';

export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? 'available';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200);

  const vehicles = await prisma.vehicle.findMany({
    where: status === 'all' ? {} : { status },
    include: { photos: { orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
  return NextResponse.json({ vehicles });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const data = parseVehicleInput(body);
    const slug = slugify(`${data.year}-${data.make}-${data.model}-${data.trim ?? ''}-${data.stockNumber}`);

    const vehicle = await prisma.vehicle.create({
      data: {
        slug,
        vin: data.vin,
        stockNumber: data.stockNumber,
        year: data.year,
        make: data.make,
        model: data.model,
        trim: data.trim,
        bodyStyle: data.bodyStyle,
        condition: data.condition,
        engine: data.engine,
        transmission: data.transmission,
        drivetrain: data.drivetrain,
        fuelType: data.fuelType,
        cityMpg: data.cityMpg,
        highwayMpg: data.highwayMpg,
        exteriorColor: data.exteriorColor,
        interiorColor: data.interiorColor,
        doors: data.doors,
        seats: data.seats,
        mileage: data.mileage,
        price: data.price,
        msrp: data.msrp,
        status: data.status,
        headline: data.headline,
        description: data.description,
        features: data.features,
        accidentFree: data.accidentFree,
        oneOwner: data.oneOwner,
        serviceRecords: data.serviceRecords,
        carfaxUrl: data.carfaxUrl,
        featured: data.featured,
        favourite: data.favourite,
        photos: {
          create: data.photos.map((p, i) => ({
            url: p.url,
            alt: p.alt ?? null,
            position: i,
            isHero: p.isHero ?? i === 0
          }))
        }
      },
      include: { photos: true }
    });
    await writeSnapshot();
    return NextResponse.json({ vehicle });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', issues: e.issues }, { status: 400 });
    }
    console.error('[vehicles.create]', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
