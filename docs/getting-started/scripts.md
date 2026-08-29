# Scripts

Custom scripts in `./scripts/` that extend the project's tooling.

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
