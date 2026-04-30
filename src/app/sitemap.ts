import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { DEALER } from '@/lib/dealer';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = DEALER.website.replace(/\/$/, '');
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'available' },
    select: { slug: true, updatedAt: true }
  });

  const staticPages: MetadataRoute.Sitemap = [
    '', '/inventory', '/financing', '/trade-in', '/sell', '/about', '/contact', '/service'
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: p === '' ? 1.0 : 0.8
  }));

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
