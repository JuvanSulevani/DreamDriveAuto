import { prisma } from '@/lib/prisma';
import { ensureAdmin } from '@/lib/require-admin';
import SyndicationControls from '@/components/admin/SyndicationControls';

export const dynamic = 'force-dynamic';

export default async function AdminSyndicationPage() {
  await ensureAdmin();

  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: 'syndication.' } }
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const runs = await prisma.syndicationRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: 30
  });

  // Detect missing SFTP credentials so we can surface a warning
  const credentials = {
    autotrader: Boolean(process.env.AUTOTRADER_SFTP_HOST && process.env.AUTOTRADER_SFTP_USER && process.env.AUTOTRADER_SFTP_PASS),
    cargurus: Boolean(process.env.CARGURUS_SFTP_HOST && process.env.CARGURUS_SFTP_USER && process.env.CARGURUS_SFTP_PASS)
  };

  return (
    <>
      <div className="mb-10">
        <div className="eyebrow text-ash">Inventory Distribution</div>
        <h1 className="display text-5xl mt-2">Syndication</h1>
        <p className="text-ash text-sm mt-3 max-w-xl">
          Push your inventory to AutoTrader, CarGurus, and other listing partners on a schedule.
          Toggle channels on/off, trigger one-off runs, and review delivery history.
        </p>
      </div>

      <SyndicationControls
        autoTraderEnabled={map['syndication.autotrader.enabled'] === 'true'}
        carGurusEnabled={map['syndication.cargurus.enabled'] === 'true'}
        credentials={credentials}
        runs={runs.map((r) => ({
          id: r.id,
          channel: r.channel,
          startedAt: r.startedAt.toISOString(),
          finishedAt: r.finishedAt?.toISOString() ?? null,
          status: r.status,
          vehicleCount: r.vehicleCount,
          filePath: r.filePath,
          errorMessage: r.errorMessage
        }))}
      />
    </>
  );
}
