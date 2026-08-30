#!/usr/bin/env node
/**
 * Unified test runner for a single source file.
 *
 * Usage:
 *   node scripts/test.mjs <source-file> [--no-coverage] [-m|--mutation] [-e|--e2e]
 *
 * Flags:
 *   --no-coverage   Skip coverage collection (vitest only)
 *   -m, --mutation  Chain Stryker mutation testing after vitest
 *   -e, --e2e       Run Playwright e2e tests instead of vitest
 *
 * -m and -e are mutually exclusive.
 *
 * Examples:
 *   node scripts/test.mjs "src/app/[locale]/(main)/_components/theme-provider.tsx"
 *   node scripts/test.mjs "src/core/i18n/components/locale-switcher.tsx" -m
 *   node scripts/test.mjs "src/core/i18n/components/locale-switcher.tsx" -e
 *
 * Steps:
 *   1. Parse args: source file path + flags (-m, -e, --no-coverage)
 *   2. If -e: run Playwright with the pattern as substring filter, then exit
 *   3. Verify the source file exists on disk
 *   4. Derive spec file paths (beside source or in __tests__/)
 *   5. Run Vitest on the spec files with coverage scoped to the source file
 *   6. If -m: run Stryker on the source file using the base stryker.config.mjs
 *   7. If -m: extract survived mutants from mutation.json → .temp/mutants.txt
 */
import { spawnSync } from 'node:child_process';
import {
  accessSync,
  constants,
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

// --- Helpers ---
/**
Escape glob special chars so [locale] and (main) are treated literally.
*/
const escapeGlob = (s) => s.replaceAll(/[()[\]{}]/g, (m) => `[${m}]`);
/**
Escape regex special chars for vitest/playwright filename filters.
*/
const escapeRegex = (s) => s.replaceAll(/[()[\]{}\\]/g, (m) => `\\${m}`);

/**
Resolve the full path to a binary on PATH (avoids sonarjs/no-os-command-from-path).
*/
function resolveBin(name) {
  for (const directory of process.env.PATH.split(path.delimiter)) {
    if (!directory) continue;
    try {
      const candidate = path.join(directory, name);
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // not found in this directory, try next
    }
  }
  return name;
}

const PNPM = resolveBin('pnpm');

// === Step 1: Parse args ===
const arguments_ = process.argv.slice(2);
const hasNoCoverage = arguments_.includes('--no-coverage');
const hasMutation =
  arguments_.includes('-m') || arguments_.includes('--mutation');
const hasPlaywright = arguments_.includes('-e') || arguments_.includes('--e2e');

if (hasMutation && hasPlaywright) {
  console.error('Error: -m/--mutation and -e/--e2e are mutually exclusive.');
  process.exit(1);
}

const sourceFile = arguments_.find((a) => !a.startsWith('-'));

if (!sourceFile) {
  console.error(
    'Usage: node scripts/test.mjs <source-file> [--no-coverage] [-m|--mutation] [-e|--e2e]',
  );
  process.exit(1);
}

// === Step 2: E2E mode — run Playwright (accepts substring patterns) ===
if (hasPlaywright) {
  const result = spawnSync(PNPM, ['exec', 'playwright', 'test', sourceFile], {
    stdio: 'inherit',
  });
  process.exit(result.status ?? 1);
}

// === Step 3: Verify source file exists (vitest/mutation modes require a real file) ===
if (!existsSync(sourceFile)) {
  console.error(`Error: file not found: ${sourceFile}`);
  process.exit(1);
}

// === Step 4: Derive spec file paths ===
// src/foo/bar.ts → src/foo/bar.spec.ts   OR src/foo/__tests__/bar.spec.ts
// src/foo/bar.ts → src/foo/bar.test.ts   OR src/foo/__tests__/bar.test.ts
const directory = path.dirname(sourceFile);
const extension = path.extname(sourceFile);
const base = path.basename(sourceFile, extension);
const escapedDirectory = escapeGlob(directory);

function findSpecs(...suffixes) {
  const results = [];
  for (const suffix of suffixes) {
    results.push(...globSync(`${escapedDirectory}/${base}.${suffix}.{ts,tsx}`));
    results.push(...globSync(`${escapedDirectory}/__tests__/${base}.${suffix}.{ts,tsx}`));
  }
  return results;
}

const specFiles = findSpecs('spec', 'test');

if (specFiles.length === 0) {
  console.error(`No spec file found for ${sourceFile}`);
  console.error(`  Looked for: ${directory}/${base}.{spec,test}.{ts,tsx}`);
  console.error(`  Looked for: ${directory}/__tests__/${base}.{spec,test}.{ts,tsx}`);
  process.exit(1);
}

// === Step 5: Run Vitest with coverage scoped to the source file ===
// Vitest CLI filter is a substring match on file paths — pass raw paths.
const vitestArguments = ['vitest', 'run'];
if (!hasNoCoverage) {
  vitestArguments.push(
    '--coverage',
    '--coverage.include',
    escapeGlob(sourceFile),
  );
}
for (const spec of specFiles) {
  vitestArguments.push(spec);
}

const vitestResult = spawnSync(PNPM, ['exec', ...vitestArguments], {
  stdio: 'inherit',
});
if (vitestResult.status !== 0) {
  process.exit(vitestResult.status ?? 1);
}

// === Step 6: Mutation mode — run Stryker ===
if (!hasMutation) process.exit(0);

mkdirSync('.temp', { recursive: true });

// Clear incremental cache so stale mutants don't pollute the report
try {
  unlinkSync('.stryker-tmp/incremental.json');
} catch {}
writeFileSync('.temp/mutants.txt', '');

console.log(`\n🧬 Running Stryker mutation tests on ${sourceFile}...\n`);
const strykerResult = spawnSync(
  PNPM,
  ['exec', 'stryker', 'run', '--mutate', escapeGlob(sourceFile)],
  { stdio: 'inherit' },
);
if (strykerResult.status !== 0) {
  process.exit(strykerResult.status ?? 1);
}

// === Step 7: Extract survived mutants → .temp/mutants.txt ===
try {
  const report = JSON.parse(
    readFileSync('reports/mutation/mutation.json', 'utf8'),
  );

  // Build test id → test name map
  const testNames = new Map();
  const testFiles = Object.values(report.testFiles);
  for (const testFile of testFiles) {
    const tests = testFile.tests ?? [];
    for (const test of tests) {
      testNames.set(test.id, test.name);
    }
  }

  // Collect survived mutants for our source file only
  const blocks = [];
  for (const [filePath, fileData] of Object.entries(report.files)) {
    if (filePath !== sourceFile) continue;
    const sourceLines = readFileSync(filePath, 'utf8').split('\n');
    const mutants = fileData.mutants ?? [];
    const survived = mutants.filter((m) => m.status === 'Survived');
    for (const mutant of survived) {
      blocks.push(formatMutant(mutant, filePath, sourceLines, testNames));
    }
  }

  writeFileSync(
    '.temp/mutants.txt',
    blocks.join('\n\n') + (blocks.length > 0 ? '\n' : ''),
  );
  if (blocks.length > 0) {
    console.log(
      `\n⚠️  ${blocks.length} survived mutant(s) — saved to .temp/mutants.txt`,
    );
  }
} catch {
  // report not found, nothing to extract
}

/**
 * Format a single survived mutant as a readable block.
 */
function formatMutant(mutant, filePath, sourceLines, testNames) {
  const { mutatorName, replacement, location, coveredBy } = mutant;
  const { start, end } = location;
  const line = sourceLines[start.line - 1];
  const mutated =
    line.slice(0, start.column - 1) + replacement + line.slice(end.column - 1);

  const lines = [
    `[Survived] ${mutatorName}`,
    `${filePath}:${start.line}:${start.column}`,
    `-     ${line}`,
    `+     ${mutated}`,
  ];

  if (coveredBy?.length) {
    const names = coveredBy.map((id) => testNames.get(id)).filter(Boolean);
    lines.push('Tests ran:');
    for (const name of names.slice(0, 3)) lines.push(`    ${name}`);
    if (names.length > 3) lines.push(`  and ${names.length - 3} more`);
  }
  return lines.join('\n');
}
