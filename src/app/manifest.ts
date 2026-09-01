import type { MetadataRoute } from 'next';

import meta from '@/../messages/en/meta';
import { app } from '@/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: app.title,
    short_name: app.title,
    description: meta.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/images/logo-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/logo-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
