import type { MetadataRoute } from 'next';
import { APP_HOMEPAGE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = new URL(APP_HOMEPAGE_URL).origin;
  const now = new Date();
  const routes = ['/', '/precos', '/politica-de-privacidade', '/termos-de-uso', '/manual'];
  const ROOT_PRIORITY = 1;
  const DEFAULT_PRIORITY = 0.7;

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? ROOT_PRIORITY : DEFAULT_PRIORITY,
  }));
}
