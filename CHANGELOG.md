# saaskip

## 0.15.0

### Minor Changes

- 1d326d2: Centralize day-one customization files into `src/config/` and add onboarding guide. Rename `app` export to `brand` and `{app}` i18n placeholder to `{brand}`. Move navigation and icons registry into `src/config/`. Drop redundant `app.keywords` and inline `app.logo`.

## 0.14.1

### Patch Changes

- b94ab47: Interpolate app name in page descriptions via `{app}` placeholder instead of hardcoded string, and move rich text rendering helpers to the i18n module.

## 0.14.0

### Minor Changes

- 0e5ec79: Add footer with social links, categorized navigation, locale switcher, and scroll-to-top logo click behavior

## 0.13.0

### Minor Changes

- 223b273: Changed `createPageMetadata` to accept `{ locale, namespace, path }` explicitly instead of reading `headers()`. This enables static prerendering (SSG) for all pages — landing, FAQ, and what's included are now generated as static HTML at build time instead of server-rendered on demand.

## 0.12.0

### Minor Changes

- f54b516: Added a dynamic navbar with mobile menu, active section tracking, and scroll-aware styling. Introduced a reusable PageLayout for standalone pages, landing page sections (hero, features, pricing, stats, FAQ, CTA, what's included), and a centralized navigation config. Extracted `parsePathname` and `handleHashScroll` helpers for locale-aware routing. Repositioned marketing copy from testing methodology to customer outcomes across README, docs homepage, and package description. Updated OG image.

## 0.11.1

### Patch Changes

- c25c81e: Rename project to saaskip across configuration, documentation, and brand assets.

## 0.11.0

### Minor Changes

- f80125a: Fix secure cookie attributes bypass, add Logo component and response headers, refactor middleware architecture, and harden test suite

  - Fix `withSecureCookies` bypass: move to outermost middleware position so
    `HttpOnly`, `SameSite`, and `Secure` attributes are applied to all response
    cookies (including `NEXT_LOCALE` set by next-intl)
  - Restore middleware chain execution for non-API routes in `withIntl`
  - Add `Logo` component with `next-image` optimization and i18n alt text
  - Set `x-locale` response header for non-API routes
  - Set `x-pathname` request/response header for full pathname tracking
  - Extract middleware stack to dedicated `proxy-stack.ts` module
  - Remove redundant `withSeo` middleware in favor of `x-pathname` header
  - Drop redundant icons metadata in favor of Next.js file convention
  - Harden all 50 test files: replace `toHaveBeenCalledOnce()` with
    `toHaveBeenCalled()`, eliminate unjustified dynamic imports, add consistent
    mock cleanup, replace weak `not.toBe('')` with `toBeTruthy()`, fix
    `mockHeaders` edge case, fix `sql` mock typing
  - Improve e2e tests: use locator-based auto-retry assertions, parametrize
    x-pathname tests, add serial mode to theme-toggle, verify NEXT_LOCALE
    cookie is actually HttpOnly via `context.cookies()`
  - Add e2e header checks for middleware response headers (x-locale, x-pathname,
    CSP, security headers, CSRF protection)
  - Add unit tests for i18n/request, instrumentation, instrumentation-client,
    and Logo component
  - Document withSecureCookies outermost position and onion model in security guide
  - Update architecture and SEO guides for proxy-stack and header flow
  - Enable Stryker mutation testing job in CI

## 0.10.0

### Minor Changes

- b3452ea: Add complete SEO stack: metadata generation, sitemap, robots, OpenGraph/Twitter cards, JSON-LD structured data, PWA manifest, and documentation. Switch i18n translation source of truth from French to English.

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
