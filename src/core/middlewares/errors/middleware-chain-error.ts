import { AppError, ErrorCode } from '@/core/errors';

export class MiddlewareChainError extends AppError {
  constructor(context?: Record<string, unknown>, cause?: unknown) {
    super(
      ErrorCode.MIDDLEWARE_CHAIN_ERROR,
      'Middleware chain execution failed',
      500,
      context,
      { cause },
    );
  }
}
