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
  mkdirSync,
  readFileSync,
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

  // Clear mutants file at startup
  mkdirSync('.temp', { recursive: true });
  const mutantsFile = '.temp/mutants.txt';
  writeFileSync(mutantsFile, '');

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

  // Extract survived mutants from the report and save to .temp/mutants.txt
  extractSurvivedMutants(sourceFiles, mutantsFile);
}

/**
 * Parse the Stryker mutation report and extract survived mutants.
 * Writes the list to the mutants file and prints a summary message.
 */
function extractSurvivedMutants(sourcePaths, mutantsFile) {
  const reportPath = 'reports/mutation/mutation.json';
  let report;
  try {
    report = JSON.parse(readFileSync(reportPath, 'utf8'));
  } catch {
    return; // report not found, nothing to extract
  }

  const testNames = new Map();
  for (const testFile of Object.values(report.testFiles)) {
    for (const test of testFile.tests ?? []) {
      testNames.set(test.id, test.name);
    }
  }

  const blocks = [];
  for (const [filePath, fileData] of Object.entries(report.files)) {
    if (!sourcePaths.includes(filePath)) continue;
    const sourceLines = readFileSync(filePath, 'utf8').split('\n');
    const survived = (fileData.mutants ?? []).filter(
      (m) => m.status === 'Survived',
    );
    for (const mutant of survived) {
      blocks.push(formatMutant(mutant, filePath, sourceLines, testNames));
    }
  }

  writeFileSync(
    mutantsFile,
    blocks.join('\n\n') + (blocks.length > 0 ? '\n' : ''),
  );

  if (blocks.length > 0) {
    console.log(
      `\n⚠️  ${blocks.length} survived mutant(s) found — saved to ${mutantsFile}`,
    );
  }
}

function formatMutant(mutant, filePath, sourceLines, testNames) {
  const { mutatorName, replacement, location, coveredBy } = mutant;
  const { start, end } = location;
  let original;
  let mutated;
  if (start.line === end.line) {
    const line = sourceLines[start.line - 1];
    original = line;
    mutated =
      line.slice(0, start.column - 1) +
      replacement +
      line.slice(end.column - 1);
  } else {
    original = sourceLines.slice(start.line - 1, end.line).join('\n');
    const firstLine = sourceLines[start.line - 1];
    const lastLine = sourceLines[end.line - 1];
    mutated =
      firstLine.slice(0, start.column - 1) +
      replacement +
      lastLine.slice(end.column - 1);
  }

  const lines = [
    `[Survived] ${mutatorName}`,
    `${filePath}:${start.line}:${start.column}`,
  ];
  for (const originalLine of original.split('\n')) {
    lines.push(`-     ${originalLine}`);
  }
  lines.push(`+     ${mutated}`);

  if (coveredBy?.length) {
    const names = coveredBy.map((id) => testNames.get(id)).filter(Boolean);
    lines.push('Tests ran:');
    for (const name of names.slice(0, 3)) {
      lines.push(`    ${name}`);
    }
    if (names.length > 3) {
      lines.push(`  and ${names.length - 3} more tests!`);
    }
  }

  return lines.join('\n');
}
