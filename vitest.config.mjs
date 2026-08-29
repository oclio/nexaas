import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

import ignore from './ignore.mjs';

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
    include: [
      'src/**/*.e2e-spec.ts',
      'src/**/*.e2e-spec.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        '**/*.d.ts',
        'src/__tests__/**',
        'src/**/__tests__/**',
        'src/**/__e2e__/**',
        'src/**/types/**',
        'src/ui/components/ui/**',
        'src/core/config/index.ts',
        'src/ui/fonts/index.ts',
      ],
    },
  },
});
