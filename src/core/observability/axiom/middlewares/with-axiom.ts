import { transformMiddlewareRequest } from '@axiomhq/nextjs';
import { NextResponse } from 'next/server';

import { env } from '@/core/config/env';
import type { CustomMiddleware } from '@/core/middlewares/types';
import { logger } from '@/core/observability/axiom/server';

export const withAxiom: CustomMiddleware = async (request, event, next) => {
  if (!env.AXIOM_TOKEN || !env.AXIOM_DATASET) {
    return next();
  }

  const traceId = crypto.randomUUID();
  request.headers.set('x-trace-id', traceId);

  try {
    const [message, context] = transformMiddlewareRequest(request);
    logger.info(message, { ...context, traceId });
  } catch {
    // Logging errors should not break the request
  }

  const start = Date.now();
  let response: Response | NextResponse | undefined;
  try {
    response = await next();
  } finally {
    const duration = Date.now() - start;

    if (response) {
      response.headers.set('x-trace-id', traceId);

      // Set cookie so client-side web vitals can correlate with server logs
      if (response instanceof NextResponse) {
        response.cookies.set('x-trace-id', traceId, {
          httpOnly: false,
          sameSite: 'strict',
          path: '/',
        });
      }
    }

    try {
      logger.info('Request completed', {
        method: request.method,
        url: request.url,
        status: response?.status ?? 500,
        duration,
        traceId,
      });
    } catch {
      // Logging errors should not break the request
    }
  }

  try {
    event.waitUntil(logger.flush());
  } catch {
    // Flush errors should not break the request
  }

  if (!response) {
    throw new Error('Middleware chain returned no response');
  }

  return response;
};
