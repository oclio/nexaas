# Project Structure

```text
src/
  config.ts            → app metadata (title, description, URL, author, logos)
  proxy.ts             → middleware chain entrypoint
  instrumentation.ts   → server-side instrumentation (Sentry, Axiom)
  instrumentation-client.ts → client-side instrumentation (Sentry)
  app/                 → Next.js App Router
    [locale]/          → locale-prefixed routes (en, fr)
      layout.tsx       → root layout with metadata, theme, i18n
      (main)/          → main route group
        (landing)/     → landing page
      not-found.tsx    → 404 page
    api/               → API routes
      health/          → health check endpoint
      web-vitals/      → Core Web Vitals collector
    global-error.tsx   → global error boundary
  core/                → foundational infrastructure
    async/             → withTimeout helper, TimeoutError
    auth/              → Better Auth schemas and role types
    env/               → typed environment variable validation
    db/                → Drizzle ORM client, health check
    errors/            → AppError class, error codes, message helpers
    helpers/           → shared utilities (string formatting)
    i18n/              → next-intl routing, messages, locale switcher
    mailer/            → Resend email client, template rendering, recipient whitelist
    middlewares/       → composable middleware chain
    observability/     → Axiom logging, Sentry error tracking, web vitals, health checks
    security/          → Arcjet, CSP, CSRF, body size limit, secure cookies
  ui/                  → UI components and utilities
    components/        → shadcn/ui components, theme toggle, dev tools
    helpers/           → cn() class merge utility
    hooks/             → useIsMounted and other client hooks
    fonts/             → font definitions
    icons/             → icon exports
    styles/            → global CSS
emails/                → React Email templates
messages/              → i18n translation files (en, fr)
tests/                 → shared test helpers and mocks
```

## Key files

| File                          | Purpose                                                |
| ----------------------------- | ------------------------------------------------------ |
| `src/config.ts`               | App metadata — the first file to edit when customizing |
| `src/core/env/index.ts`       | Environment variable validation                        |
| `src/proxy.ts`                | Middleware chain entrypoint                            |
| `src/app/[locale]/layout.tsx` | Root layout with metadata, theme, and i18n             |

See [Architecture](/core/architecture) for details on each `core/` module.
