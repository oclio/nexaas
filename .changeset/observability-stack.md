---
'nexaas': minor
---

Add observability stack: Axiom logging, Sentry error tracking, health endpoint, and VitePress documentation.

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
