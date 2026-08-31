# nexaas

## 0.9.0

### Minor Changes

- 3b04058: Add Storybook 10, a reusable useIsMounted hook, and a ScreenSize development tool

  - Set up Storybook 10 with Next.js + Vite framework, including a11y, vitest, docs, and MCP addons
  - Extract the useSyncExternalStore mounted pattern from ThemeToggle into a reusable useIsMounted hook
  - Add a ScreenSize dev tool: a floating breakpoint badge with configurable size, position, and colored mode, persisted via a Zustand store
  - Improve the Stryker Tailwind ignorer plugin to handle ObjectExpression mutators and reduce cognitive complexity

## 0.8.0

### Minor Changes

- 32e6142: Add PostgreSQL with pgvector, Drizzle ORM, Docker Compose, and database health check

  - PostgreSQL 16 with pgvector via Docker Compose (port 5455, healthcheck, persistent volume)
  - Drizzle ORM client with postgres-js driver and connection pooling
  - Auth schemas (users, sessions, accounts, verifications) with initial migration
  - Database health check integrated into /api/health endpoint
  - db:generate, db:migrate, db:studio scripts
  - Documentation: infrastructure and database pages

## 0.7.0

### Minor Changes

- 6d6b73b: Added a transactional email module powered by Resend and React Email. Includes a composable `sendEmail` API (HTML, React elements, named templates), recipient whitelist filtering, structured logging to Axiom and Sentry, and a newsletter confirmation email template with Tailwind CSS styling. A local preview server (`pnpm email:dev`) is available for template development.

## 0.6.0

### Minor Changes

- 0d2a115: Added internationalization (i18n) support with next-intl: locale-prefixed routing (`/en`, `/fr`), type-safe messages with `TranslationSchema`, `LocaleSwitcher` component, and `withIntl` middleware for API locale header resolution.

## 0.5.0

### Minor Changes

- 9b3d3af: Add shadcn/ui foundation with dark mode and theme toggle

  - Integrate shadcn/ui (base-lyra style) with Button component, cn helper, and Hugeicons registry
  - Add ThemeProvider (next-themes) wired into RootLayout with OKLCH dark mode CSS variables
  - Add ThemeToggle component on the landing page with localStorage persistence
  - Add UI documentation page covering component system, dark mode, helpers, and icons

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
