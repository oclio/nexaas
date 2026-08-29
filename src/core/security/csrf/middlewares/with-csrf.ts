import { NextResponse } from 'next/server';

import { env } from '@/core/config/env';
import type { CustomMiddleware } from '@/core/middlewares/types';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF protection using the Origin header check (OWASP 2023+ strategy).
 *
 * For state-changing requests, the `Origin` (or `Sec-Fetch-Site`) header must
 * match the application's own origin. Browsers automatically set these headers
 * on cross-origin requests, and they cannot be overridden by JavaScript.
 *
 * Requests without an Origin header (e.g. curl, server-to-server) are allowed
 * to pass through, as they are not subject to CSRF by definition.
 */
export const withCsrf: CustomMiddleware = async (request, _event, next) => {
  if (!unsafeMethods.has(request.method)) {
    return next();
  }

  const origin = request.headers.get('origin');
  if (!origin) {
    // No Origin header = not a browser request, allow through
    return next();
  }

  const allowedOrigin = env.NEXT_PUBLIC_APP_URL;
  if (origin === allowedOrigin) {
    return next();
  }

  return new NextResponse('CSRF check failed', { status: 403 });
};
