import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { slugify } from '@/lib/format';

export const runtime = 'nodejs';

const VehicleSchema = z.object({
  vin: z.string().min(11).max(17),
  stockNumber: z.string().min(1),
  year: z.number().int(),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional().nullable(),
  bodyStyle: z.string().min(1),
  condition: z.enum(['new', 'used', 'certified']),
  engine: z.string().optional().nullable(),
  transmission: z.string().optional().nullable(),
  drivetrain: z.string().optional().nullable(),
  fuelType: z.string().optional().nullable(),
  cityMpg: z.number().int().optional().nullable(),
  highwayMpg: z.number().int().optional().nullable(),
  exteriorColor: z.string().optional().nullable(),
  interiorColor: z.string().optional().nullable(),
  doors: z.number().int().optional().nullable(),
  seats: z.number().int().optional().nullable(),
  mileage: z.number().int().min(0),
  price: z.number().int().min(0),
  msrp: z.number().int().optional().nullable(),
  status: z.enum(['available', 'pending', 'sold', 'hidden']).default('available'),
  headline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.string().optional().nullable(),
  accidentFree: z.boolean().default(true),
  oneOwner: z.boolean().default(false),
  serviceRecords: z.boolean().default(false),
  carfaxUrl: z.string().url().optional().nullable(),
  featured: z.boolean().default(false),
  photos: z.array(z.object({
    url: z.string(),
    alt: z.string().optional().nullable(),
    isHero: z.boolean().optional()
  })).default([])
});

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
    const data = VehicleSchema.parse(body);
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
    return NextResponse.json({ vehicle });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', issues: e.issues }, { status: 400 });
    }
    console.error('[vehicles.create]', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
