import 'server-only';
import { prisma } from './prisma';
import { readSnapshot, reviveVehicle, type SnapshotVehicle } from './snapshot';
import { retryTransient } from './public-query';

/**
 * Public vehicle data, snapshot-first.
 *
 * The S3 snapshot is rewritten on every admin write (create/update/delete/
 * favourite/settings), so it's an always-current mirror of public data that
 * needs no database. Reading it per-request:
 *   - keeps public pages fast (~100ms S3 GET) and Aurora-independent (the DB
 *     stays paused → no ~$40/mo keep-warm),
 *   - and, crucially, makes admin edits appear on the very next reload WITHOUT
 *     relying on CDN/ISR cache invalidation — `revalidatePath` does not
 *     reliably purge the served page on AWS Amplify Hosting, which left the
 *     public site stuck on the build-time snapshot.
 *
 * `readSnapshot` is wrapped in React.cache, so all callers in one request
 * (list/home/detail + site settings) share a single S3 read. The DB is only
 * touched if the snapshot is missing entirely (e.g. a brand-new environment).
 */
export async function getPublicVehicles(): Promise<SnapshotVehicle[]> {
  const snap = await readSnapshot();
  if (snap) return snap.vehicles.map(reviveVehicle);

  try {
    return await retryTransient('public.vehicles', () =>
      prisma.vehicle.findMany({
        where: { NOT: { status: 'hidden' } },
        include: { photos: { orderBy: { position: 'asc' } } },
        orderBy: { createdAt: 'desc' }
      })
    );
  } catch {
    return [];
  }
}

/** A single non-hidden vehicle by slug, snapshot-first. null if not found. */
export async function getPublicVehicleBySlug(slug: string): Promise<SnapshotVehicle | null> {
  const all = await getPublicVehicles();
  return all.find((v) => v.slug === slug) ?? null;
}
