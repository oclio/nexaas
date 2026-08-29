import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { AppError } from '@/core/errors/app-error';
import { getErrorMessage } from '@/core/errors/helpers';
import { MiddlewareChainError } from '@/core/middlewares/errors/middleware-chain-error';
import type { CustomMiddleware } from '@/core/middlewares/types';
import { logger } from '@/core/observability/axiom/server';

export function chain(middlewares: CustomMiddleware[]) {
  return async (request: NextRequest, event: NextFetchEvent) => {
    let index = -1;

    const dispatch = async (
      index_: number,
    ): Promise<Response | NextResponse> => {
      if (index_ <= index) throw new Error('next() called multiple times');
      index = index_;

      const middleware = middlewares[index_];
      if (!middleware) {
        return NextResponse.next({
          request: { headers: request.headers },
        });
      }

      try {
        return await middleware(request, event, () => dispatch(index_ + 1));
      } catch (error) {
        const appError =
          error instanceof AppError
            ? error
            : new MiddlewareChainError(
                { originalError: getErrorMessage(error) },
                error,
              );

        logger.error(appError.message, {
          err: appError,
          code: appError.code,
          statusCode: appError.statusCode,
          context: appError.context,
          url: request.url,
          method: request.method,
          pathname: request.nextUrl.pathname,
          traceId: request.headers.get('x-trace-id') ?? undefined,
        });

        throw appError;
      }
    };

    return dispatch(0);
  };
}
