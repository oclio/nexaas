# Observability

nexaas uses [Axiom](https://axiom.co) for structured logging, request tracing, and web vitals collection.

## Setup

Add these environment variables to your `.env`:

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

> **Tip:** You can run nexaas locally without any Axiom account. Simply leave `AXIOM_TOKEN` and `AXIOM_DATASET` unset — everything works, just without telemetry.

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

## Health check

The `/api/health` endpoint (`src/app/api/health/route.ts`) provides a lightweight health check for load balancers and monitoring tools.

| Scenario                                | Response                                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| No `HEALTH_CHECK_SECRET` set            | `{ "status": "ok" }` — 200                                                                                                                        |
| Missing or wrong `Authorization` header | `{ "status": "ok" }` — 200                                                                                                                        |
| Valid `Authorization: Bearer <secret>`  | `{ "status": "ok" \| "degraded", "timestamp": "...", "services": { "logs": { "status": "healthy" \| "unhealthy" \| "disabled" } } }` — 200 or 503 |

Set `HEALTH_CHECK_SECRET` to enable detailed service checks. Without it, the endpoint always returns `ok` without checking upstream services.
