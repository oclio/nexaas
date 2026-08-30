#!/usr/bin/env node
/**
 * Wrapper to run vitest with a file path containing regex special chars
 * (Next.js route groups like `(main)` and dynamic segments like `[locale]`).
 *
 * Usage:
 *   node scripts/test.mjs <path-or-pattern> [--no-coverage] [-m|--mutation]
 *
 * Examples:
 *   node scripts/test.mjs "src/app/[locale]/(main)/(landing)/__tests__/page.spec.tsx"
 *   node scripts/test.mjs page.spec --no-coverage
 *   node scripts/test.mjs instrumentation-client -m
 *   node scripts/test.mjs instrumentation -m   (matches both instrumentation.ts and instrumentation-client.ts)
 */
import { spawnSync } from 'node:child_process';
import {
  accessSync,
  constants,
  globSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

/**
Resolve the full path to a binary on PATH.
*/
function resolveBin(name) {
  for (const directory of process.env.PATH.split(path.delimiter)) {
    if (!directory) continue;
    try {
      const candidate = path.join(directory, name);
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // not found in this dir, try next
    }
  }
  return name;
}

const PNPM = resolveBin('pnpm');

const arguments_ = process.argv.slice(2);
const hasNoCoverage = arguments_.includes('--no-coverage');
const hasMutation =
  arguments_.includes('-m') || arguments_.includes('--mutation');
const pattern = arguments_.find(
  (a) => !a.startsWith('-') && a !== '--no-coverage',
);

if (!pattern) {
  console.error(
    'Usage: node scripts/test.mjs <path-or-pattern> [--no-coverage] [-m|--mutation]',
  );
  process.exit(1);
}

// Only escape regex chars that appear in Next.js route paths: ( ) [ ] { } \
// Don't escape . since it's harmless in path matching
const escaped = pattern.includes('/')
  ? pattern.replaceAll(/[()[\]{}\\]/g, (m) => `\\${m}`)
  : pattern;

// Derive source file(s) from the test pattern.
// "instrumentation" → matches src/instrumentation.ts AND src/instrumentation-client.ts
// "instrumentation-client" → matches src/instrumentation-client.ts only
// Filter out spec files and keep only source files.
const globPattern = pattern.includes('/')
  ? `${pattern.replace(/\.spec\.(ts|tsx)$/, '')}.{ts,tsx}`
  : `src/**/${pattern.replace(/\.spec$/, '')}*.{ts,tsx}`;
const sourceFiles = globSync(globPattern).filter(
  (f) => !f.includes('.spec.'),
);

const vitestArguments = ['vitest', 'run'];
if (!hasNoCoverage && sourceFiles.length > 0) {
  vitestArguments.push('--coverage');
  for (const file of sourceFiles) {
    vitestArguments.push('--coverage.include', file);
  }
}
vitestArguments.push(escaped);

const vitestResult = spawnSync(PNPM, ['exec', ...vitestArguments], {
  stdio: 'inherit',
});

if (vitestResult.status !== 0) {
  process.exit(vitestResult.status ?? 1);
}

if (hasMutation) {
  if (sourceFiles.length === 0) {
    console.error(`No source file found matching ${globPattern}`);
    process.exit(1);
  }

  // Clear incremental cache so stale mutants from previous full runs don't
  // pollute the report (e.g. config/index.ts, fonts/index.ts).
  try {
    unlinkSync('.stryker-tmp/incremental.json');
  } catch {
    // file may not exist on first run, safe to ignore
  }

  // Generate a temporary stryker config that overrides `related` to true
  // and limits `mutate` to the target file(s). With `related: true`, Stryker
  // only runs tests that cover the mutated file instead of the full suite.
  const temporaryConfig = `.stryker-tmp/stryker.focus.config.mjs`;
  const mutateArray = sourceFiles.map((f) => `'${f}'`).join(', ');
  writeFileSync(
    temporaryConfig,
    `import baseConfig from '../stryker.config.mjs';\n` +
      `export default {\n` +
      `  ...baseConfig,\n` +
      `  mutate: [${mutateArray}],\n` +
      `  vitest: { ...baseConfig.vitest, related: true },\n` +
      `};\n`,
  );

  const fileList =
    sourceFiles.length === 1 ? sourceFiles[0] : `${sourceFiles.length} files`;
  console.log(`\n🧬 Running Stryker mutation tests on ${fileList}...\n`);
  const strykerResult = spawnSync(
    PNPM,
    ['exec', 'stryker', 'run', temporaryConfig],
    { stdio: 'inherit' },
  );

  if (strykerResult.status !== 0) {
    process.exit(strykerResult.status ?? 1);
  }
}
