import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/format';
import { ArrowUpRight } from 'lucide-react';
import { ensureAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await ensureAdmin();

  const [
    inventoryCount, soldThisMonth, openLeads, recentLeads, recentVehicles, lastRun
  ] = await Promise.all([
    prisma.vehicle.count({ where: { status: 'available' } }),
    prisma.vehicle.count({
      where: {
        status: 'sold',
        soldAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }
    }),
    prisma.lead.count({ where: { status: 'new' } }),
    prisma.lead.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true }
    }),
    prisma.vehicle.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { photos: { take: 1, orderBy: { position: 'asc' } } }
    }),
    prisma.syndicationRun.findFirst({ orderBy: { startedAt: 'desc' } })
  ]);

  const inventoryValue = await prisma.vehicle.aggregate({
    where: { status: 'available' },
    _sum: { price: true }
  });

  return (
    <>
      <Header title="Dashboard" subtitle="Overview · Today" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-ink-500 mb-12">
        <Stat label="Active Inventory" value={String(inventoryCount)} />
        <Stat label="Inventory Value" value={formatPrice(inventoryValue._sum.price ?? 0)} />
        <Stat label="Sold This Month" value={String(soldThisMonth)} />
        <Stat label="Open Leads" value={String(openLeads)} accent={openLeads > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section>
          <Header2 title="Recent Leads" href="/admin/leads" />
          <div className="border hairline divide-y divide-ink-500">
            {recentLeads.length === 0 && <Empty body="No leads yet." />}
            {recentLeads.map((l) => (
              <Link key={l.id} href={`/admin/leads`} className="block p-5 hover:bg-ink-700 transition-colors">
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="text-cream">{l.firstName} {l.lastName}</div>
                    <div className="font-mono text-[10px] text-ash mt-1 tracking-ticker uppercase">{l.type.replace('_', ' ')}</div>
                  </div>
                  <div className="font-mono text-[10px] text-ash">
                    {new Date(l.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
                {l.vehicle && (
                  <div className="text-ash text-xs mt-2 truncate">
                    Re: {l.vehicle.year} {l.vehicle.make} {l.vehicle.model}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Header2 title="Recent Inventory" href="/admin/inventory" />
          <div className="border hairline divide-y divide-ink-500">
            {recentVehicles.map((v) => (
              <Link key={v.id} href={`/admin/inventory/${v.id}`} className="flex items-center gap-4 p-4 hover:bg-ink-700 transition-colors">
                <div className="w-16 h-12 bg-ink-700 shrink-0 overflow-hidden">
                  {v.photos[0] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={v.photos[0].url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-cream truncate text-sm">{v.year} {v.make} {v.model} {v.trim}</div>
                  <div className="font-mono text-[10px] text-ash mt-0.5">Stock {v.stockNumber} · {v.status}</div>
                </div>
                <div className="font-mono text-xs text-cream tabular">{formatPrice(v.price)}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-12">
        <Header2 title="Syndication" href="/admin/syndication" />
        <div className="border hairline p-6">
          {lastRun ? (
            <div className="flex flex-wrap gap-8 items-center">
              <div>
                <div className="spec-label">Last run</div>
                <div className="text-cream mt-1">{new Date(lastRun.startedAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="spec-label">Channel</div>
                <div className="text-cream mt-1 uppercase">{lastRun.channel}</div>
              </div>
              <div>
                <div className="spec-label">Status</div>
                <div className={`mt-1 ${lastRun.status === 'success' ? 'text-copper' : lastRun.status === 'failed' ? 'text-copper-glow' : 'text-cream'}`}>
                  {lastRun.status}
                </div>
              </div>
              <div>
                <div className="spec-label">Vehicles</div>
                <div className="text-cream mt-1 tabular">{lastRun.vehicleCount}</div>
              </div>
              <Link href="/admin/syndication" className="btn-ghost ml-auto">
                Manage <ArrowUpRight size={12} />
              </Link>
            </div>
          ) : (
            <Empty body="No syndication runs yet. Configure SFTP credentials in .env, enable a channel in Syndication settings, and trigger a run." />
          )}
        </div>
      </section>
    </>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-12">
      <div className="eyebrow text-ash">{subtitle}</div>
      <h1 className="display text-6xl mt-2">{title}</h1>
    </div>
  );
}

function Header2({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex justify-between items-baseline mb-4">
      <div className="display text-2xl">{title}</div>
      <Link href={href} className="eyebrow text-ash hover:text-cream flex items-center gap-1">
        View all <ArrowUpRight size={11} />
      </Link>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-ink p-8">
      <div className="spec-label">{label}</div>
      <div className={`display tabular text-5xl mt-3 ${accent ? 'text-copper' : ''}`}>{value}</div>
    </div>
  );
}

function Empty({ body }: { body: string }) {
  return <div className="p-8 text-center text-ash text-sm">{body}</div>;
}
