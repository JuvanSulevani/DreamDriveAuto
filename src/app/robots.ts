import type { MetadataRoute } from 'next';
import { DEALER } from '@/lib/dealer';

export default function robots(): MetadataRoute.Robots {
  const base = DEALER.website.replace(/\/$/, '');
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }
    ],
    sitemap: `${base}/sitemap.xml`
  };
}
