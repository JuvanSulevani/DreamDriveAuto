import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeSnapshot } from '@/lib/snapshot';
import { revalidatePublicContent } from '@/lib/revalidate';
import { retryTransient } from '@/lib/public-query';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { favourite } = await req.json() as { favourite: boolean };

  try {
    // retryTransient so the toggle survives an Aurora Serverless wake-up — with
    // keep-warm disabled the DB may be paused when the admin clicks.
    const vehicle = await retryTransient('vehicles.favourite', () =>
      prisma.vehicle.update({
        where: { id },
        data: { favourite },
        select: { id: true, favourite: true }
      })
    );
    await writeSnapshot();
    revalidatePublicContent();
    return NextResponse.json({ vehicle });
  } catch (e) {
    console.error('[vehicles.favourite]', e);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
