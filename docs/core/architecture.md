# Architecture

The `src/core/` directory contains the foundational infrastructure of nexaas. These modules are not features — they are the building blocks that features build on.

## Structure

```text
src/core/
  config/env/        → typed environment variable validation
  errors/            → AppError class, error codes, message helpers
  helpers/           → shared utilities (string formatting)
  middlewares/       → composable middleware chain + proxy entrypoint
```

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
