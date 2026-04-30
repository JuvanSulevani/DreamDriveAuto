import { prisma } from '@/lib/prisma';
import { ensureAdmin } from '@/lib/require-admin';
import LeadsTable from '@/components/admin/LeadsTable';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage({ searchParams }: { searchParams: { type?: string; status?: string } }) {
  await ensureAdmin();

  const where: Record<string, unknown> = {};
  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.status) where.status = searchParams.status;

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { vehicle: true },
    take: 200
  });

  return (
    <>
      <div className="mb-10">
        <div className="eyebrow text-ash">Customer inquiries</div>
        <h1 className="display text-5xl mt-2">Leads</h1>
      </div>

      <LeadsTable leads={leads.map((l) => ({
        id: l.id,
        type: l.type,
        status: l.status,
        firstName: l.firstName,
        lastName: l.lastName,
        email: l.email,
        phone: l.phone ?? '',
        message: l.message ?? '',
        payload: l.payload,
        source: l.source ?? '',
        createdAt: l.createdAt.toISOString(),
        vehicle: l.vehicle ? { year: l.vehicle.year, make: l.vehicle.make, model: l.vehicle.model, slug: l.vehicle.slug } : null
      }))} />
    </>
  );
}
