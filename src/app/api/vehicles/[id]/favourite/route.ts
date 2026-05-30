import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeSnapshot } from '@/lib/snapshot';
import { revalidatePublicContent } from '@/lib/revalidate';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { favourite } = await req.json() as { favourite: boolean };

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: { favourite },
    select: { id: true, favourite: true }
  });
  await writeSnapshot();
  revalidatePublicContent();

  return NextResponse.json({ vehicle });
}
