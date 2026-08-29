// @ts-expect-error - Stryker config type not available at lint time

import ignores from './ignore.mjs';
import testExclude from './test-exclude.mjs';

// Derive directory-level ignore patterns from glob patterns ending with /**
const sharedIgnorePatterns = ignores
  .filter((p) => p.endsWith('/**'))
  .map((p) => `/${p.replace('/**', '')}`);

const config = {
  testRunner: 'vitest',
  reporters: ['html', 'clear-text', 'progress', 'dashboard', 'json'],
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
    './.stryker-plugins/tailwind-ignorer.mjs',
  ],
  timeoutMS: 240_000,
  timeoutFactor: 3,
  coverageAnalysis: 'perTest',
  ignoreStatic: false,
  incremental: true,
  incrementalFile: '.stryker-tmp/incremental.json',
  concurrency: 4,
  mutate: [
    'src/**/*.ts',
    'src/**/*.tsx',
    ...testExclude
      .filter((p) => !p.includes('__e2e__'))
      .map((pattern) => `!${pattern}`),
  ],
  ignorePatterns: [...sharedIgnorePatterns, 'src/**/__e2e__/**'],
  thresholds: {
    high: 95,
    low: 80,
    break: 65,
  },
  vitest: {
    configFile: 'vitest.config.mjs',
    related: false,
  },
};

export default config;
