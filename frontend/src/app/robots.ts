import type { MetadataRoute } from 'next';
import { siteUrl } from './sitemap';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/leads',
        '/calls',
        '/campaigns',
        '/analytics',
        '/ai-models',
        '/whatsapp',
        '/billing',
        '/settings',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
