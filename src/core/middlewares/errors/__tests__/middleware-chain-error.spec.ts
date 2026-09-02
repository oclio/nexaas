import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/codes';
import { MiddlewareChainError } from '@/core/middlewares/errors/middleware-chain-error';

describe('MiddlewareChainError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extends AppError', () => {
    const error = new MiddlewareChainError();

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(MiddlewareChainError);
  });

  it('sets the correct error code', () => {
    const error = new MiddlewareChainError();

    expect(error.code).toBe(ErrorCode.MIDDLEWARE_CHAIN_ERROR);
  });

  it('sets a non-empty message', () => {
    const error = new MiddlewareChainError();

    expect(error.message).toBeTruthy();
  });

  it('defaults to status code 500', () => {
    const error = new MiddlewareChainError();

    expect(error.statusCode).toBe(500);
  });

  it('accepts a context object', () => {
    const context = { key: 'value' };
    const error = new MiddlewareChainError(context);

    expect(error.context).toMatchObject(context);
  });

  it('accepts a cause and sets it on the error', () => {
    const cause = new Error('Original failure');
    const error = new MiddlewareChainError(undefined, cause);

    expect(error.cause).toBe(cause);
  });

  it('accepts both context and cause', () => {
    const context = { key: 'value' };
    const cause = new Error('Original failure');
    const error = new MiddlewareChainError(context, cause);

    expect(error.context).toMatchObject(context);
    expect(error.cause).toBe(cause);
  });

  it('sets name to the constructor name', () => {
    const error = new MiddlewareChainError();

    expect(error.name).toBe(MiddlewareChainError.name);
  });

  it('works without any arguments', () => {
    const error = new MiddlewareChainError();

    expect(error.context).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });
});
