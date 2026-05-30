import type { MetadataRoute } from 'next';
import { DEALER } from '@/lib/dealer';
import { getSiteSettings } from '@/lib/site-settings-store';
import { getPublicVehicles } from '@/lib/public-data';

// Read the snapshot per-request so newly-added cars appear without a redeploy
// (still no DB, so Aurora stays paused).
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = DEALER.website.replace(/\/$/, '');
  const { pages } = await getSiteSettings();

  const optional: Array<[string, boolean]> = [
    ['/financing', pages.financingVisible],
    ['/trade-in', pages.tradeInVisible],
    ['/sell', pages.sellVisible],
    ['/service', pages.serviceVisible],
    ['/about', pages.aboutVisible]
  ];

  const paths = ['', '/inventory', '/contact', ...optional.filter(([, on]) => on).map(([p]) => p)];

  const staticPages: MetadataRoute.Sitemap = paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: p === '' ? 1.0 : 0.8
  }));

  const vehicles = await getSitemapVehicles();

  return [
    ...staticPages,
    ...vehicles.map((v) => ({
      url: `${base}/inventory/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.9
    }))
  ];
}

async function getSitemapVehicles() {
  // Snapshot-first (same as the public pages) so generating the sitemap doesn't
  // wake Aurora on every crawler hit.
  const vehicles = await getPublicVehicles();
  return vehicles
    .filter((v) => v.status === 'available')
    .map((v) => ({ slug: v.slug, updatedAt: v.updatedAt }));
}
