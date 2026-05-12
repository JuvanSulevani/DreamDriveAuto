import { prisma } from '@/lib/prisma';
import { ensureAdmin } from '@/lib/require-admin';
import LeadsTable from '@/components/admin/LeadsTable';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<{ type?: string; status?: string }> }) {
  await ensureAdmin();
  const filters = await searchParams;

  const where: Record<string, unknown> = {};
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;

  let loadError = false;
  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { vehicle: true },
    take: 200
  }).catch((error) => {
    loadError = true;
    console.error('[admin.leads]', error);
    return [];
  });

  return (
    <>
      <div className="mb-10">
        <div className="eyebrow text-ash">Customer inquiries</div>
        <h1 className="display text-5xl mt-2">Leads</h1>
      </div>

      <LeadsTable loadError={loadError} leads={leads.map((l) => ({
        id: l.id,
        type: String(l.type || 'contact'),
        status: String(l.status || 'new'),
        firstName: String(l.firstName || ''),
        lastName: String(l.lastName || ''),
        email: String(l.email || ''),
        phone: l.phone ?? '',
        message: l.message ?? '',
        payload: typeof l.payload === 'string' ? l.payload : l.payload ? JSON.stringify(l.payload) : null,
        source: l.source ?? '',
        createdAt: l.createdAt.toISOString(),
        vehicle: l.vehicle ? { year: l.vehicle.year, make: l.vehicle.make, model: l.vehicle.model, slug: l.vehicle.slug } : null
      }))} />
    </>
  );
}
