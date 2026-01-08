import type { MetadataRoute } from 'next';
import { APP_HOMEPAGE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = new URL(APP_HOMEPAGE_URL).origin;
  const now = new Date();
  const routes = ['/', '/precos', '/politica-de-privacidade', '/termos-de-uso', '/manual'];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
