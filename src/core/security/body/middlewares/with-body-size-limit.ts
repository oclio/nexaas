import { NextResponse } from 'next/server';

import type { CustomMiddleware } from '@/core/middlewares/types';

const MAX_BODY_SIZE = 1024 * 1024; // 1MB

const methodsWithBody = new Set(['POST', 'PUT', 'PATCH']);

/**
 * Rejects requests with a body larger than MAX_BODY_SIZE to prevent
 * memory exhaustion DoS attacks.
 *
 * Checks the `Content-Length` header before the body is parsed.
 * Requests without a `Content-Length` header are allowed through
 * (e.g. chunked transfer encoding, handled by the runtime).
 */
export const withBodySizeLimit: CustomMiddleware = async (
  request,
  _event,
  next,
) => {
  if (!methodsWithBody.has(request.method)) {
    return next();
  }

  const contentLengthHeader = request.headers.get('content-length');
  if (!contentLengthHeader) {
    return next();
  }

  const contentLength = Number(contentLengthHeader);
  if (Number.isNaN(contentLength) || contentLength > MAX_BODY_SIZE) {
    return new NextResponse('Payload Too Large', { status: 413 });
  }

  return next();
};
