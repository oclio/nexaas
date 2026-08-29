import { AppError, ErrorCode } from '@/core/errors';

export class TimeoutError extends AppError {
  constructor(
    message = 'Operation timed out',
    context?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    // Code: TIMEOUT, Status: 504 Gateway Timeout
    super(ErrorCode.TIMEOUT, message, 504, context, options);
  }
}
