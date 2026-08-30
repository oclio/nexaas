import * as Sentry from '@sentry/nextjs';

import { logger } from '@/core/observability/axiom/server';

export async function register() {
  const runtime = process.env.NEXT_RUNTIME;
  if (!runtime) return;

  if (runtime === 'nodejs') {
    await import('../sentry.server.config');
  } else {
    await import('../sentry.edge.config');
  }
  await import('@/core/observability/axiom/server');
}

export async function onRequestError(
  error: unknown,
  request: Parameters<typeof Sentry.captureRequestError>[1],
  errorContext: Parameters<typeof Sentry.captureRequestError>[2],
) {
  // Sentry: stack traces, source maps, error grouping
  Sentry.captureRequestError(error, request, errorContext);

  // Axiom: structured logs with request context, searchable alongside middleware logs
  logger.error('Unhandled request error', {
    err: error,
    method: request.method,
    path: request.path,
    ...errorContext,
  });

  await logger.flush();
}
