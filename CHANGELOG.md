# nexaas

## 0.4.0

### Minor Changes

- 2cff6dc: Added a defense-in-depth security middleware stack: Arcjet (rate limiting, bot protection, shield), CSP with nonce generation, CSRF protection via Origin header, request body size limit (1MB), secure cookie enforcement (HttpOnly, Secure, SameSite=Strict), and email whitelist for dev gating. Denied requests are logged to Axiom and Sentry. New env vars: `ARCJET_KEY`, `ARCJET_ENV`, `EMAIL_WHITELIST`.

## 0.3.0

### Minor Changes

- ada203d: Add observability stack: Axiom logging, Sentry error tracking, health endpoint, and VitePress documentation.

  - Integrate Axiom for structured logging, request tracing (via `x-trace-id`), and web vitals collection
  - Integrate Sentry for error tracking, session replays, and performance traces with configurable sample rates
  - Add `/api/health` endpoint with service status checks (Axiom + Sentry), protected by `HEALTH_CHECK_SECRET`
  - Add `/api/web-vitals` endpoint for client-side metric ingestion
  - Add `global-error.tsx` error boundary capturing unhandled client errors to Sentry
  - Expose `traceId` in proxy error responses for log correlation
  - Add typed env validation with `@t3-oss/env-nextjs` and Zod
  - Add error system (`AppError`, error codes, helpers) and composable middleware chain
  - Add VitePress documentation site with architecture, observability, and API reference
  - Add GitHub Pages deploy workflow for docs

## 0.2.0

### Minor Changes

- f6751c8: Configure development tooling and testing stack: ESLint 10, Prettier 3, Knip, Gitleaks, axe-core, markdownlint, cspell, Vitest 4, Playwright 1.55, Stryker 10, Husky 9, lint-staged, commitlint, Commitizen, Changesets, and @next/bundle-analyzer.

## 0.1.0

### Minor Changes

- 6c67f3e: Configure development tooling and testing stack: ESLint 10, Prettier 3, Knip, Gitleaks, axe-core, markdownlint, cspell, Vitest 4, Playwright 1.55, Stryker 10, Husky 9, lint-staged, commitlint, Commitizen, Changesets, and @next/bundle-analyzer.
