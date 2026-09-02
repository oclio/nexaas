import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/codes';

describe('AppError', () => {
  it('creates an error with required fields', () => {
    const error = new AppError(ErrorCode.UNKNOWN_ERROR, 'Something went wrong');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(error.statusCode).toBe(500);
    expect(error.context).toBeUndefined();
  });

  it('accepts a custom status code', () => {
    const error = new AppError(ErrorCode.TIMEOUT, 'Request timed out', 408);

    expect(error.statusCode).toBe(408);
  });

  it('accepts a falsy status code of 0', () => {
    const error = new AppError(ErrorCode.TIMEOUT, 'No content', 0);

    expect(error.statusCode).toBe(0);
  });

  it('accepts a context object', () => {
    const context = { userId: 42, route: '/api/users' };
    const error = new AppError(ErrorCode.UNKNOWN_ERROR, 'Failed', 500, context);

    expect(error.context).toMatchObject(context);
  });

  it('accepts an empty context object', () => {
    const error = new AppError(ErrorCode.UNKNOWN_ERROR, 'Failed', 500, {});

    expect(error.context).toEqual({});
  });

  it('accepts error options with cause', () => {
    const cause = new Error('Original failure');
    const error = new AppError(
      ErrorCode.UNKNOWN_ERROR,
      'Wrapped',
      500,
      undefined,
      { cause },
    );

    expect(error.cause).toBe(cause);
  });

  it('accepts empty error options without cause', () => {
    const error = new AppError(
      ErrorCode.UNKNOWN_ERROR,
      'Wrapped',
      500,
      undefined,
      {},
    );

    expect(error.cause).toBeUndefined();
  });

  it('sets name to the constructor name', () => {
    const error = new AppError(ErrorCode.UNKNOWN_ERROR, 'Test');

    expect(error.name).toBe(AppError.name);
  });

  it('preserves the name on subclasses', () => {
    class CustomError extends AppError {
      constructor() {
        super(ErrorCode.UNKNOWN_ERROR, 'Custom');
      }
    }

    const error = new CustomError();

    expect(error.name).toBe(CustomError.name);
  });
});
