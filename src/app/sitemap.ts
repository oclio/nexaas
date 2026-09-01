import type { MetadataRoute } from 'next';

import { env } from '@/core/env';
import { routing } from '@/core/i18n/routing';

const routes = [{ path: '', changeFrequency: 'weekly' as const, priority: 1 }];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${env.NEXT_PUBLIC_APP_URL}/${locale}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            `${env.NEXT_PUBLIC_APP_URL}/${l}${route.path}`,
          ]),
        ),
      },
    })),
  );
}
