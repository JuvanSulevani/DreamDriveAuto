import 'server-only';
import { cache } from 'react';
import { GetObjectCommand, NoSuchKey, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Photo, Vehicle } from '@prisma/client';
import { prisma } from './prisma';
import { getExplicitAwsCredentials } from './aws-credentials';
import { getS3UploadConfig } from './uploads';
import { retryTransient } from './public-query';
import { DEFAULT_SITE_SETTINGS, mergeSiteSettings, SITE_SETTING_KEYS, type SiteSettings } from './site-settings';

/**
 * S3 key the snapshot lives at. Configurable via SNAPSHOT_S3_KEY in case the
 * bucket has its own conventions; defaults to a clearly-named folder.
 */
export const SNAPSHOT_KEY = process.env.SNAPSHOT_S3_KEY || 'snapshots/site-snapshot.json';

/** Vehicle/photo dates round-trip through JSON as ISO strings. */
type SerializedPhoto = Omit<Photo, 'createdAt'> & { createdAt: string };
type SerializedVehicle = Omit<Vehicle, 'createdAt' | 'updatedAt' | 'soldAt'> & {
  createdAt: string;
  updatedAt: string;
  soldAt: string | null;
  photos: SerializedPhoto[];
};

export type SiteSnapshot = {
  savedAt: string;
  settings: SiteSettings;
  vehicles: SerializedVehicle[];
};

export type SnapshotVehicle = Vehicle & { photos: Photo[] };

function makeS3Client(region: string) {
  const credentials = getExplicitAwsCredentials();
  return new S3Client({ region, ...(credentials && { credentials }) });
}

/**
 * Build a JSON snapshot of public site data (settings + non-hidden vehicles
 * with photos) and upload it to S3. Called after every admin write so the DB
 * and snapshot stay in sync.
 *
 * Why we swallow errors: by the time we get here the admin's DB write has
 * already succeeded. A transient S3 hiccup shouldn't make the operator think
 * their save failed — the snapshot is a safety net, the DB is the source of
 * truth. Errors are logged and the next admin save will rewrite the snapshot.
 */
export async function writeSnapshot(): Promise<void> {
  try {
    const config = getS3UploadConfig();
    if (!config) {
      console.warn('[snapshot] UPLOADS_S3_BUCKET not configured — skipping snapshot write');
      return;
    }

    const [vehicles, settingsRows] = await retryTransient('snapshot.fetch', async () =>
      Promise.all([
        prisma.vehicle.findMany({
          // Same filter the public site applies — 'hidden' vehicles are
          // deliberately not shown anywhere, so they don't need to survive a
          // DB outage either.
          where: { NOT: { status: 'hidden' } },
          include: { photos: { orderBy: { position: 'asc' } } },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.setting.findMany({
          where: { key: { in: Array.from(SITE_SETTING_KEYS) } }
        })
      ])
    );

    const settings = mergeSiteSettings(
      Object.fromEntries(settingsRows.map((s) => [s.key, s.value]))
    );

    const snapshot: SiteSnapshot = {
      savedAt: new Date().toISOString(),
      settings,
      vehicles: vehicles.map(serializeVehicle)
    };

    const client = makeS3Client(config.region);
    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: SNAPSHOT_KEY,
      Body: JSON.stringify(snapshot),
      ContentType: 'application/json',
      CacheControl: 'no-store'
    }));
    console.log(`[snapshot] wrote ${vehicles.length} vehicles, ${settingsRows.length} settings`);
  } catch (error) {
    console.error('[snapshot] write failed', error);
  }
}

/**
 * Read the latest snapshot from S3. Returns null on any failure (no snapshot
 * yet, S3 unavailable, corrupt JSON). Wrapped in React.cache() so all the
 * fallbacks in a single page request share one S3 GET.
 */
export const readSnapshot = cache(async function readSnapshot(): Promise<SiteSnapshot | null> {
  const config = getS3UploadConfig();
  if (!config) return null;

  try {
    const client = makeS3Client(config.region);
    const result = await client.send(new GetObjectCommand({
      Bucket: config.bucket,
      Key: SNAPSHOT_KEY
    }));
    const body = await result.Body?.transformToString();
    if (!body) return null;
    return JSON.parse(body) as SiteSnapshot;
  } catch (error) {
    // NoSuchKey on a brand-new deploy isn't an error worth logging loudly.
    if (error instanceof NoSuchKey) return null;
    console.error('[snapshot] read failed', error);
    return null;
  }
});

/**
 * Convenience: settings only. Returns default settings when no snapshot
 * exists so callers always get a usable SiteSettings object.
 */
export async function readSettingsFromSnapshot(): Promise<SiteSettings> {
  const snap = await readSnapshot();
  return snap?.settings ?? DEFAULT_SITE_SETTINGS;
}

/**
 * Restore JS Date objects on vehicles read from the snapshot so they match the
 * shape Prisma would return — page components type their inputs as Vehicle &
 * { photos: Photo[] } and assume Dates.
 */
export function reviveVehicle(v: SerializedVehicle): SnapshotVehicle {
  return {
    ...v,
    createdAt: new Date(v.createdAt),
    updatedAt: new Date(v.updatedAt),
    soldAt: v.soldAt ? new Date(v.soldAt) : null,
    photos: v.photos.map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))
  };
}

function serializeVehicle(v: SnapshotVehicle): SerializedVehicle {
  return {
    ...v,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
    soldAt: v.soldAt?.toISOString() ?? null,
    photos: v.photos.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))
  };
}
