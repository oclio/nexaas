import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitepress';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url)),
      },
    },
  },
  title: 'nexaas',
  description:
    'The opinionated Next.js SaaS starter for senior devs.',

  base: '/',
  cleanUrls: true,
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/getting-started/' },
      { text: 'Core', link: '/core/env' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Quick Start', link: '/getting-started/' },
            { text: 'Project Structure', link: '/getting-started/structure' },
            { text: 'Scripts', link: '/getting-started/scripts' },
          ],
        },
        {
          text: 'Core',
          items: [
            { text: 'Environment Variables', link: '/core/env' },
          ],
        },
      ],
    },

    search: {
      provider: 'local',
    },

    footer: {
      message:
        'Released under the <a href="https://github.com/oclio/nexaas/blob/main/LICENSE">MIT License</a> · <a href="https://github.com/sponsors/oclio">GitHub Sponsors</a> · <a href="https://buymeacoffee.com/oclio">Buy Me a Coffee</a>',
      copyright:
        'Copyright © 2026 <a href="https://oclio.dev">@oclio</a> — TypeScript Engineer',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/oclio/nexaas' },
    ],

    editLink: {
      pattern: 'https://github.com/oclio/nexaas/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
});
