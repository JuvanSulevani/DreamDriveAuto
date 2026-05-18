import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { DEALER } from '@/lib/dealer';
import { hasUsableDatabaseConfig } from '@/lib/database-url';
import { getSiteSettings } from '@/lib/site-settings-store';

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
  if (!hasUsableDatabaseConfig()) return [];

  try {
    return await prisma.vehicle.findMany({
      where: { status: 'available' },
      select: { slug: true, updatedAt: true }
    });
  } catch (error) {
    console.warn('[sitemap] Skipping vehicle URLs because the database is unavailable during sitemap generation.', error);
    return [];
  }
}
