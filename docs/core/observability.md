# Observability

nexaas uses [Axiom](https://axiom.co) for structured logging, request tracing, and web vitals collection, and [Sentry](https://sentry.io) for error tracking and session replays.

## Setup

### Axiom

```bash
AXIOM_TOKEN=xaat-your-token-here
AXIOM_DATASET=your-dataset-name
LOG_LEVEL=info
```

| Variable        | Required | Description                                                                                                                                        |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AXIOM_TOKEN`   | No       | Axiom API token. If unset, **Axiom is fully bypassed** — no logs are sent, the middleware passes through, and the health check reports `disabled`. |
| `AXIOM_DATASET` | No       | Dataset name where logs are stored. If unset, ingestion is skipped.                                                                                |
| `LOG_LEVEL`     | No       | Minimum log level. One of `error`, `warn`, `info`, `debug`, `off`. Defaults to `info`.                                                             |

### Sentry

```bash
NEXT_PUBLIC_SENTRY_DSN=https://sentry.io/your-project-dsn
SENTRY_AUTH_TOKEN=sntryu-your-auth-token
```

| Variable                 | Required | Description                                                                                                                                                |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN` | No       | Sentry DSN (client-side accessible). If unset, **Sentry is fully bypassed** — no errors are captured, no replays, and the health check reports `disabled`. |
| `SENTRY_AUTH_TOKEN`      | No       | Sentry auth token for source map uploads during build. Place in `.env.sentry-build-plugin`.                                                                |

> **Tip:** You can run nexaas locally without any Axiom or Sentry account. Simply leave the env vars unset — everything works, just without telemetry.

## Server-side logging

The logger is created in `src/core/observability/axiom/server.ts` and exported as `logger`. It uses `@axiomhq/logging` with a console transport (always) and an Axiom transport (when configured).

```ts
import { logger } from '@/core/observability/axiom/server';

logger.info('User signed in', { userId: 42 });
logger.error('Payment failed', { orderId: 'ord_123' });
```

## Request tracing

The `withAxiom` middleware (`src/core/observability/axiom/middlewares/with-axiom.ts`) runs on every matched request:

1. Generates a `traceId` via `crypto.randomUUID()`
2. Sets `x-trace-id` header on the request and response
3. Sets `x-trace-id` cookie (non-httpOnly) so client-side web vitals can correlate
4. Logs the incoming request and the completed request with duration and status

All logs emitted during a request (middleware, route handlers, `onRequestError`) carry the same `traceId`. In Axiom, filter by `traceId` to see the full log trail of a single request — from entry to response, including any errors.

The middleware is registered in `src/proxy.ts`:

```ts
const proxies: CustomMiddleware[] = [withAxiom];
```

If `AXIOM_TOKEN` or `AXIOM_DATASET` is unset, the middleware passes through without logging.

## Web vitals

The `WebVitals` component (`src/core/observability/axiom/components/web-vitals.tsx`) is mounted in the root layout. It collects Core Web Vitals (CLS, LCP, FCP, TTFB, INP) via `next/web-vitals` and sends them to `/api/web-vitals`.

- In production: metrics are sent via `navigator.sendBeacon` (fallback: `fetch` with `keepalive`)
- In development: metrics are ignored

The `/api/web-vitals` endpoint ingests the metric into Axiom with the correlated `traceId` from the cookie.

## Error tracking and performance

Sentry captures unhandled errors, stack traces, session replays, and distributed traces (performance monitoring).

### Traces

Sentry traces instrument Next.js server components, API routes, middleware, and external calls (DB, fetch). Each trace is a tree of spans showing where time is spent. The sample rate is configurable:

- **Development**: 100% of traces captured (`tracesSampleRate: 1`)
- **Production**: 10% of traces captured (`tracesSampleRate: 0.1`)

Adjust `tracesSampleRate` in `src/core/observability/sentry/config/index.ts` based on your traffic volume.

### Server-side

`src/instrumentation.ts` is the Next.js instrumentation hook entrypoint. It dynamically imports `sentry.server.config.ts` (nodejs runtime) or `sentry.edge.config.ts` (edge runtime), which call `initSentry()` from `src/core/observability/sentry/config/index.ts`.

The `onRequestError` export captures unhandled request errors in both Sentry and Axiom:

- **Sentry**: stack traces, source maps, error grouping
- **Axiom**: structured logs with request context, searchable alongside middleware logs

### Client-side

`src/instrumentation-client.ts` initializes Sentry with session replay integration in production only (when `NEXT_PUBLIC_SENTRY_DSN` is set). In development, Sentry is not initialized on the client.

Unhandled client-side errors are caught by `src/app/global-error.tsx` — a Next.js error boundary that captures the exception to Sentry via `Sentry.captureException` and renders the default Next.js error page.

### Configuration

| Setting                    | Development | Production |
| -------------------------- | ----------- | ---------- |
| DSN                        | unset       | from env   |
| `tracesSampleRate`         | 1           | 0.1        |
| `enableLogs`               | true        | true       |
| `sendDefaultPii`           | false       | true       |
| Session replay             | disabled    | enabled    |
| `replaysSessionSampleRate` | —           | 0.1        |
| `replaysOnErrorSampleRate` | —           | 1          |

If `NEXT_PUBLIC_SENTRY_DSN` is unset, Sentry is not initialized — no errors are captured and no replays are recorded.

## Health check

The `/api/health` endpoint (`src/app/api/health/route.ts`) provides a lightweight health check for load balancers and monitoring tools. It checks both Axiom (`logs`) and Sentry (`errorsCapture`) services.

| Scenario                                | Response                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| No `HEALTH_CHECK_SECRET` set            | `{ "status": "ok" }` — 200                                                                                                 |
| Missing or wrong `Authorization` header | `{ "status": "ok" }` — 200                                                                                                 |
| Valid `Authorization: Bearer <secret>`  | `{ "status": "ok" \| "degraded", "timestamp": "...", "services": { "logs": {...}, "errorsCapture": {...} } }` — 200 or 503 |

Each service returns one of: `healthy`, `unhealthy`, or `disabled` (when the corresponding env vars are not set).

Set `HEALTH_CHECK_SECRET` to enable detailed service checks. Without it, the endpoint always returns `ok` without checking upstream services.
