# Architecture

The `src/core/` directory contains the foundational infrastructure of nexaas. These modules are not features — they are the building blocks that features build on.

## Structure

```text
src/core/
  async/             → withTimeout helper, TimeoutError
  config/env/        → typed environment variable validation
  errors/            → AppError class, error codes, message helpers
  helpers/           → shared utilities (string formatting)
  i18n/              → next-intl routing, messages, locale switcher
  mailer/            → Resend email client, template rendering, recipient whitelist
  middlewares/       → composable middleware chain + proxy entrypoint
  observability/     → Axiom logging, Sentry error tracking, request tracing, web vitals, health checks
  security/          → Arcjet, CSP, CSRF, body size limit, secure cookies, email whitelist
```

## async

| File                      | Purpose                                                  |
| ------------------------- | -------------------------------------------------------- |
| `helpers/with-timeout.ts` | Runs a promise with a maximum timeout delay              |
| `errors/timeout-error.ts` | Error thrown when an operation exceeds its timeout (504) |

## config/env

Validates environment variables at startup using `@t3-oss/env-nextjs` and zod. See [Environment Variables](./env) for the full guide.

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

## i18n

Locale-prefixed routing, type-safe messages, and server/client translation access via [next-intl](https://next-intl.dev). See [Internationalization](./i18n) for the full guide.

## mailer

Transactional email via [Resend](https://resend.com) with [React Email](https://react.email) templates. Supports HTML, React elements, and named templates. Recipients are filtered through the email whitelist. See [Mailer](./mailer) for the full guide.

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

## observability

Structured logging, request tracing, web vitals via [Axiom](https://axiom.co), error tracking via [Sentry](https://sentry.io), and a `/api/health` endpoint for load balancers. See [Observability](./observability) for the full guide.

## security

Defense-in-depth via composable middleware: CSP, CSRF, body size limit, secure cookies, email whitelist, and Arcjet for rate limiting and bot detection. Each layer can be independently enabled or disabled via environment variables. See [Security](./security) for the full guide.
