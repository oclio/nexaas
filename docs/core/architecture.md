# Architecture

The `src/core/` directory contains the foundational infrastructure of nexaas. These modules are not features — they are the building blocks that features build on.

## Structure

```text
src/core/
  async/             → withTimeout helper, TimeoutError
  config/env/        → typed environment variable validation
  errors/            → AppError class, error codes, message helpers
  helpers/           → shared utilities (string formatting)
  middlewares/       → composable middleware chain + proxy entrypoint
  observability/     → Axiom logging, Sentry error tracking, request tracing, web vitals, health checks
  security/          → Arcjet, CSP, CSRF, body size limit, secure cookies, email whitelist
```

## config/env

Validates environment variables at startup using `@t3-oss/env-nextjs` and zod. See [Environment Variables](./env) for the full guide.

## async

| File                      | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `helpers/with-timeout.ts` | Runs a promise with a maximum timeout delay              |
| `errors/timeout-error.ts` | Error thrown when an operation exceeds its timeout (504) |

## errors

| File           | Purpose                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `app-error.ts` | Base error class with `code`, `statusCode`, and `context`                                                        |
| `codes.ts`     | Enum of error codes (`MIDDLEWARE_CHAIN_ERROR`, `UNKNOWN_ERROR`, `TIMEOUT`)                                       |
| `helpers.ts`   | `getErrorMessage()` normalizes any thrown value to a string; `formatErrorMessage()` cleans and sentence-cases it |

To create a domain-specific error, extend `AppError`:

```ts
import { AppError, ErrorCode } from '@/core/errors';

class BillingError extends AppError {
  constructor(context?: Record<string, unknown>, cause?: unknown) {
    super(ErrorCode.UNKNOWN_ERROR, 'Billing failed', 400, context, { cause });
  }
}
```

## helpers

Small, pure utilities shared across the codebase.

| Function           | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `toSentence(text)` | Capitalizes first letter, adds trailing period if missing |

## middlewares

Next.js middleware is composed via a chain pattern instead of a single monolithic function.

| File                               | Purpose                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `types/index.ts`                   | `CustomMiddleware` type — `(req, event, next) => Promise<Response>`           |
| `chain.ts`                         | Composes an array of middlewares into a single handler with `next()` dispatch |
| `errors/middleware-chain-error.ts` | Wraps non-`AppError` thrown inside the chain                                  |

The entrypoint is `src/proxy.ts`. Middlewares are registered in the `proxies` array:

```ts
import type { CustomMiddleware } from '@/core/middlewares/types';

const myMiddleware: CustomMiddleware = async (req, event, next) => {
  // do something before
  const response = await next();
  // do something after
  return response;
};

const proxies: CustomMiddleware[] = [myMiddleware];
```

The chain runs middlewares in order, unwinds in reverse, and wraps any non-`AppError` into a `MiddlewareChainError` with the original message preserved in `context.originalError`.

## security

Defense-in-depth via composable middleware. Each layer can be independently enabled or disabled via environment variables. See [Security](./security) for the full guide.

| File                                                  | Purpose                                                                             |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `security/arcjet/middlewares/with-arcjet.ts`          | Rate limiting, bot detection, shield (SQLi/XSS). Bypassed if `ARCJET_KEY` is unset. |
| `security/csp/middlewares/with-csp.ts`                | Content-Security-Policy header with nonce generation and Sentry reporting           |
| `security/csrf/middlewares/with-csrf.ts`              | CSRF protection via Origin header check on state-changing methods                   |
| `security/body/middlewares/with-body-size-limit.ts`   | Rejects request bodies larger than 1MB (413)                                        |
| `security/cookies/middlewares/with-secure-cookies.ts` | Enforces HttpOnly, Secure, SameSite=Strict on all response cookies                  |
| `security/email-whitelist.ts`                         | `isAuthorizedEmail()` — restricts access to whitelisted emails (dev/testing)        |

## observability

Structured logging, request tracing, web vitals via [Axiom](https://axiom.co), and error tracking via [Sentry](https://sentry.io). See [Observability](./observability) for the full guide.

### Axiom

| File                              | Purpose                                                                   |
| --------------------------------- | ------------------------------------------------------------------------- |
| `axiom/client.ts`                 | Axiom API client (dataset info, ingestion)                                |
| `axiom/server.ts`                 | Server-side logger with console + Axiom transports                        |
| `axiom/middlewares/with-axiom.ts` | Middleware: trace ID, request/response logging, cookie propagation        |
| `axiom/components/web-vitals.tsx` | Client component: collects Core Web Vitals and sends to `/api/web-vitals` |
| `axiom/health/index.ts`           | Health check logic: queries Axiom dataset status with timeout             |

If `AXIOM_TOKEN` or `AXIOM_DATASET` is unset, Axiom is bypassed — no logs are sent, the middleware passes through, and the health check reports `disabled`.

### Sentry

| File                     | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `sentry/config/index.ts` | `initSentry()` — configures traces, logs, PII based on env    |
| `sentry/health/index.ts` | Health check logic: pings Sentry ingest endpoint with timeout |

Sentry is initialized via `src/instrumentation.ts` (server) and `src/instrumentation-client.ts` (client). If `NEXT_PUBLIC_SENTRY_DSN` is unset, Sentry is not initialized — no errors are captured, and the health check reports `disabled`.

Unhandled client-side errors are caught by `src/app/global-error.tsx`, which captures the exception to Sentry and renders the Next.js error page.
