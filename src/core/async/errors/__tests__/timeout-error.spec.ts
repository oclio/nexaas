import { TimeoutError } from '@/core/async/errors/timeout-error';
import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/codes';

describe('TimeoutError', () => {
  it('extends AppError', () => {
    const error = new TimeoutError();

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(TimeoutError);
  });

  it('defaults message to "Operation timed out"', () => {
    const error = new TimeoutError();

    expect(error.message).toBe('Operation timed out');
  });

  it('sets the correct error code', () => {
    const error = new TimeoutError();

    expect(error.code).toBe(ErrorCode.TIMEOUT);
  });

  it('defaults to status code 504', () => {
    const error = new TimeoutError();

    expect(error.statusCode).toBe(504);
  });

  it('accepts a custom message', () => {
    const error = new TimeoutError('Custom timeout message');

    expect(error.message).toBe('Custom timeout message');
  });

  it('accepts a context object', () => {
    const context = { operation: 'fetchData', duration: 5000 };
    const error = new TimeoutError(undefined, context);

    expect(error.context).toEqual(context);
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
    expect(error.context).toEqual(context);
    expect(error.cause).toBe(cause);
  });

  it('sets name to the constructor name', () => {
    const error = new TimeoutError();

    expect(error.name).toBe('TimeoutError');
  });
});
