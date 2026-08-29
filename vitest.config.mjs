import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import ignore from './ignore.mjs';
import testExclude from './test-exclude.mjs';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  oxc: false,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    timeout: 30_000,
    exclude: ignore,
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        ...testExclude,
        'src/ui/components/ui/**',
        'src/core/config/index.ts',
        'src/ui/fonts/index.ts',
      ],
    },
  },
});
