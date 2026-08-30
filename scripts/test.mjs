#!/usr/bin/env node
/**
 * Wrapper to run vitest with a file path containing regex special chars
 * (Next.js route groups like `(main)` and dynamic segments like `[locale]`).
 *
 * Usage:
 *   node scripts/test.mjs <path-or-pattern> [--no-coverage]
 *
 * Examples:
 *   node scripts/test.mjs "src/app/[locale]/(main)/(landing)/__tests__/page.spec.tsx"
 *   node scripts/test.mjs page.spec --no-coverage
 */
import { execSync } from 'node:child_process';

const arguments_ = process.argv.slice(2);
const hasNoCoverage = arguments_.includes('--no-coverage');
const pattern = arguments_.find(
  (a) => !a.startsWith('-') && a !== '--no-coverage',
);

if (!pattern) {
  console.error(
    'Usage: node scripts/test.mjs <path-or-pattern> [--no-coverage]',
  );
  process.exit(1);
}

// Only escape regex chars that appear in Next.js route paths: ( ) [ ] { } \
// Don't escape . since it's harmless in path matching
const escaped = pattern.includes('/')
  ? pattern.replaceAll(/[()[\]{}\\]/g, (m) => `\\${m}`)
  : pattern;

const vitestArguments = ['vitest', 'run'];
if (!hasNoCoverage) {
  // Scope coverage to files matching the test pattern, not the entire src/
  const coverageInclude = pattern.includes('/')
    ? pattern.replace(/\.spec\.(ts|tsx)$/, '.{ts,tsx}')
    : `**/${pattern.replace(/\.spec$/, '')}*.{ts,tsx}`;
  vitestArguments.push('--coverage', `--coverage.include=${coverageInclude}`);
}
vitestArguments.push(escaped);

try {
  execSync(`pnpm exec ${vitestArguments.join(' ')}`, { stdio: 'inherit' });
} catch {
  process.exit(1);
}
