import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatMiles } from '@/lib/format';
import { ensureAdmin } from '@/lib/require-admin';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await ensureAdmin();
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.status && params.status !== 'all') where.status = params.status;
  if (params.q) {
    where.OR = [
      { make: { contains: params.q } },
      { model: { contains: params.q } },
      { vin: { contains: params.q } },
      { stockNumber: { contains: params.q } }
    ];
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    include: { photos: { take: 1, orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });

  const counts = await prisma.vehicle.groupBy({
    by: ['status'],
    _count: { _all: true }
  });
  const countByStatus = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  const total = counts.reduce((s, c) => s + c._count._all, 0);

  return (
    <>
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="eyebrow text-ash">Vehicles</div>
          <h1 className="display text-5xl mt-2">Inventory</h1>
        </div>
        <Link href="/admin/inventory/new" className="btn-primary">
          <Plus size={14} /> Add Vehicle
        </Link>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <Pill href="/admin/inventory" active={!params.status || params.status === 'all'} label={`All (${total})`} />
        <Pill href="/admin/inventory?status=available" active={params.status === 'available'} label={`Available (${countByStatus.available ?? 0})`} />
        <Pill href="/admin/inventory?status=pending" active={params.status === 'pending'} label={`Pending (${countByStatus.pending ?? 0})`} />
        <Pill href="/admin/inventory?status=sold" active={params.status === 'sold'} label={`Sold (${countByStatus.sold ?? 0})`} />
        <Pill href="/admin/inventory?status=hidden" active={params.status === 'hidden'} label={`Hidden (${countByStatus.hidden ?? 0})`} />
      </div>

      <div className="border hairline">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b hairline spec-label">
          <div className="col-span-1">Photo</div>
          <div className="col-span-4">Vehicle</div>
          <div className="col-span-2">Stock / VIN</div>
          <div className="col-span-1">Mileage</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Status</div>
        </div>
        {vehicles.map((v) => (
          <Link key={v.id} href={`/admin/inventory/${v.id}`}
            className="grid grid-cols-12 gap-4 px-4 py-4 border-b hairline last:border-0 hover:bg-ink-700 transition-colors items-center">
            <div className="col-span-1">
              <div className="w-14 h-10 bg-ink-700 overflow-hidden">
                {v.photos[0] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={v.photos[0].url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            </div>
            <div className="col-span-4">
              <div className="text-cream truncate">{v.year} {v.make} {v.model} {v.trim}</div>
              <div className="font-mono text-[10px] text-ash mt-1">{v.bodyStyle} · {v.condition}</div>
            </div>
            <div className="col-span-2 font-mono text-xs text-cream/80">
              <div>{v.stockNumber}</div>
              <div className="text-ash">{v.vin}</div>
            </div>
            <div className="col-span-1 font-mono text-xs">{formatMiles(v.mileage)}</div>
            <div className="col-span-2 text-right font-mono tabular text-cream">{formatPrice(v.price)}</div>
            <div className="col-span-2 text-right">
              <StatusBadge status={v.status} />
            </div>
          </Link>
        ))}
        {vehicles.length === 0 && (
          <div className="p-12 text-center text-ash">No vehicles match.</div>
        )}
      </div>
    </>
  );
}

function Pill({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link href={href} className={`px-3 py-1.5 font-mono text-[11px] tracking-wider border ${active ? 'bg-copper border-copper text-cream' : 'border-ink-500 text-ash hover:border-cream/30'}`}>
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    available: 'bg-copper/15 text-copper-glow border-copper/40',
    pending: 'bg-cream/10 text-cream border-cream/30',
    sold: 'bg-ash/20 text-ash border-ash/40',
    hidden: 'bg-ink-700 text-ash border-ink-500'
  };
  return (
    <span className={`inline-block font-mono text-[10px] tracking-ticker uppercase border px-2 py-1 ${map[status] || ''}`}>
      {status}
    </span>
  );
}
