import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin' ? session : null;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: params.id },
    include: { photos: { orderBy: { position: 'asc' } } }
  });
  if (!vehicle) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ vehicle });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const { photos, ...rest } = body;

  // Whitelist fields that may be updated
  const allowed = [
    'vin', 'stockNumber', 'year', 'make', 'model', 'trim', 'bodyStyle', 'condition',
    'engine', 'transmission', 'drivetrain', 'fuelType', 'cityMpg', 'highwayMpg',
    'exteriorColor', 'interiorColor', 'doors', 'seats', 'mileage', 'price', 'msrp',
    'status', 'headline', 'description', 'features', 'accidentFree', 'oneOwner',
    'serviceRecords', 'carfaxUrl', 'featured'
  ];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in rest) update[k] = rest[k];

  if (rest.status === 'sold' && update.status === 'sold') update.soldAt = new Date();

  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        ...update,
        ...(Array.isArray(photos)
          ? {
              photos: {
                deleteMany: {},
                create: photos.map((p: { url: string; alt?: string; isHero?: boolean }, i: number) => ({
                  url: p.url,
                  alt: p.alt ?? null,
                  position: i,
                  isHero: p.isHero ?? i === 0
                }))
              }
            }
          : {})
      },
      include: { photos: { orderBy: { position: 'asc' } } }
    });
    return NextResponse.json({ vehicle });
  } catch (e) {
    console.error('[vehicles.update]', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  await prisma.vehicle.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
