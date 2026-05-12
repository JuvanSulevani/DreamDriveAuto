import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { DEALER } from '@/lib/dealer';
import { hasUsableDatabaseConfig } from '@/lib/database-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = DEALER.website.replace(/\/$/, '');

  const staticPages: MetadataRoute.Sitemap = [
    '', '/inventory', '/financing', '/trade-in', '/sell', '/about', '/contact', '/service'
  ].map((p) => ({
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
