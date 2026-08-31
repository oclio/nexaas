# Scripts

Custom scripts in `./scripts/` that extend the project's tooling.

## test.mjs

Unified test runner for a single source file. Runs Vitest with coverage scoped to the source file, then optionally chains Stryker mutation testing or Playwright e2e tests.

### Usage

```bash
# Run unit tests with coverage for a source file
pnpm test "src/core/i18n/components/locale-switcher.tsx"

# Run unit tests + Stryker mutation testing
pnpm test "src/core/i18n/components/locale-switcher.tsx" -m

# Run Playwright e2e tests (accepts substring patterns)
pnpm test theme-toggle -e
```

### Flags

| Flag               | Description                                |
| ------------------ | ------------------------------------------ |
| `--no-coverage`    | Skip coverage collection (vitest only)     |
| `-m`, `--mutation` | Run Stryker mutation testing after Vitest  |
| `-e`, `--e2e`      | Run Playwright e2e tests instead of Vitest |

`-m` and `-e` are mutually exclusive.

### How it works

1. Parses the source file path and flags from args
2. If `-e`: passes the pattern to Playwright as a substring filter and exits
3. Verifies the source file exists on disk
4. Derives spec file paths (`<name>.spec.ts` or `__tests__/<name>.spec.ts`)
5. Runs Vitest on the spec files with `--coverage.include` scoped to the source file
6. If `-m`: runs Stryker with `--mutate` on the source file
7. If `-m`: extracts survived mutants from `mutation.json` into `.temp/mutants.txt`

## check-a11y.mjs

Runs axe-core accessibility audits against one or more routes. Requires the dev server to be running.

### Usage

```bash
pnpm check:a11y / /about /login
pnpm check:a11y http://localhost:3000/login
```

### How it works

- Accepts paths (`/login`) or full URLs (`http://localhost:3000/login`)
- Prefixes paths with `http://localhost:3000`
- Runs the `axe` CLI with `--exit` (non-zero exit on violations)
- Exits with code 1 if any accessibility issues are found
