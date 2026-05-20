import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { parseVehicleInput } from '@/lib/vehicle-validation';
import { writeSnapshot } from '@/lib/snapshot';

export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin' ? session : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { photos: { orderBy: { position: 'asc' } } }
  });
  if (!vehicle) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ vehicle });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;

  try {
    const body = await req.json();
    const data = parseVehicleInput(body);
    const { photos, id: _id, ...vehicleData } = data;
    const update: Record<string, unknown> = { ...vehicleData };

    if (data.status === 'sold') update.soldAt = new Date();

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...update,
        photos: {
          deleteMany: {},
          create: photos.map((p, i) => ({
            url: p.url,
            alt: p.alt ?? null,
            position: i,
            isHero: p.isHero ?? i === 0
          }))
        }
      },
      include: { photos: { orderBy: { position: 'asc' } } }
    });
    await writeSnapshot();
    return NextResponse.json({ vehicle });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'validation', issues: e.issues }, { status: 400 });
    }
    console.error('[vehicles.update]', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.vehicle.delete({ where: { id } });
  await writeSnapshot();
  return NextResponse.json({ ok: true });
}
