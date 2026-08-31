import path from 'node:path';

import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  viteFinal(config) {
    config.resolve ??= {};

    const storybookDirectory = path.resolve(process.cwd(), '.storybook');

    const existingAliases = Array.isArray(config.resolve.alias)
      ? config.resolve.alias
      : Object.entries(config.resolve.alias || {}).map(
          ([find, replacement]) => ({ find, replacement }),
        );

    config.resolve.alias = [
      {
        find: '@/core/config/env',
        replacement: path.resolve(storybookDirectory, 'mocks/env.ts'),
      },
      {
        find: '@/core/i18n/navigation',
        replacement: path.resolve(storybookDirectory, 'mocks/navigation.ts'),
      },
      {
        find: '@/core/observability/logger',
        replacement: path.resolve(storybookDirectory, 'mocks/logger.ts'),
      },
      {
        find: '@/emails',
        replacement: path.resolve(process.cwd(), 'emails'),
      },
      {
        find: '@',
        replacement: path.resolve(process.cwd(), 'src'),
      },
      ...existingAliases.filter(
        (a: unknown) =>
          typeof (a as { find: string }).find === 'string' &&
          !(a as { find: string }).find.includes('actions/create'),
      ),
    ];
    return config;
  },
};
export default config;
