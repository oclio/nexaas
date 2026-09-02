import { TimeoutError } from '@/core/async/errors/timeout-error';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/codes';

describe('TimeoutError', () => {
  it('has correct defaults', () => {
    const error = new TimeoutError();

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(error.message).toBe('Operation timed out');
    expect(error.code).toBe(ErrorCode.TIMEOUT);
    expect(error.statusCode).toBe(504);
    expect(error.name).toBe(TimeoutError.name);
  });

  it('accepts a custom message', () => {
    const error = new TimeoutError('Custom timeout message');

    expect(error.message).toBe('Custom timeout message');
  });

  it('accepts a context object', () => {
    const context = { operation: 'fetchData', duration: 5000 };
    const error = new TimeoutError(undefined, context);

    expect(error.context).toMatchObject(context);
  });

  it('accepts an empty context object', () => {
    const error = new TimeoutError(undefined, {});

    expect(error.context).toEqual({});
  });

  it('accepts ErrorOptions with cause', () => {
    const cause = new Error('Connection stalled');
    const error = new TimeoutError(undefined, undefined, { cause });

    expect(error.cause).toBe(cause);
  });

  it('accepts message, context, and options together', () => {
    const context = { operation: 'db-query' };
    const cause = new Error('pool exhausted');
    const error = new TimeoutError('DB timeout', context, { cause });

    expect(error.message).toBe('DB timeout');
    expect(error.context).toMatchObject(context);
    expect(error.cause).toBe(cause);
  });
});
