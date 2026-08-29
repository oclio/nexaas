import { ErrorCode } from '@/core/errors/codes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly context: Record<string, unknown> | undefined;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 500,
    context?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
  }
}
