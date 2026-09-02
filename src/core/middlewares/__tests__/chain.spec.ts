import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/codes';
import { chain } from '@/core/middlewares/chain';
import { MiddlewareChainError } from '@/core/middlewares/errors/middleware-chain-error';
import type { CustomMiddleware } from '@/core/middlewares/types';
import { logger } from '@/core/observability/axiom/server';
import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';

// ─── helpers ───────────────────────────────────────────────────────────────

const passthroughMiddleware: CustomMiddleware = async (_req, _event, next) =>
  next();

const throwTypeError: CustomMiddleware = async () => {
  throw new TypeError('bad type');
};

const throwOriginalFailure: CustomMiddleware = async () => {
  throw new Error('original failure');
};

const doubleNextMiddleware: CustomMiddleware = async (_req, _event, next) => {
  await next();
  return next();
};

const mockRequest = (): NextRequest => mockNextRequest();
const mockEvent = mockNextFetchEvent;

function respond(body: string): CustomMiddleware {
  return async () => new Response(body);
}

// ─── tests ─────────────────────────────────────────────────────────────────

describe('chain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NextResponse when no middlewares are provided', async () => {
    const handler = chain([]);
    const response = await handler(mockRequest(), mockEvent());

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('runs a single middleware that short-circuits', async () => {
    const handler = chain([respond('hello')]);
    const response = await handler(mockRequest(), mockEvent());

    expect(await response.text()).toBe('hello');
  });

  it('passes through when middleware calls next()', async () => {
    const handler = chain([passthroughMiddleware, respond('end')]);
    const response = await handler(mockRequest(), mockEvent());

    expect(await response.text()).toBe('end');
  });

  it('runs middlewares in order', async () => {
    const order: string[] = [];
    const mw1: CustomMiddleware = async (_req, _event, next) => {
      order.push('mw1-before');
      const res = await next();
      order.push('mw1-after');
      return res;
    };
    const mw2: CustomMiddleware = async (_req, _event, next) => {
      order.push('mw2-before');
      const res = await next();
      order.push('mw2-after');
      return res;
    };
    const mw3: CustomMiddleware = async () => {
      order.push('mw3');
      return new Response('done');
    };

    const handler = chain([mw1, mw2, mw3]);
    await handler(mockRequest(), mockEvent());

    expect(order.indexOf('mw1-before')).toBeLessThan(
      order.indexOf('mw2-before'),
    );
    expect(order.indexOf('mw2-before')).toBeLessThan(order.indexOf('mw3'));
    expect(order.indexOf('mw3')).toBeLessThan(order.indexOf('mw2-after'));
    expect(order.indexOf('mw2-after')).toBeLessThan(order.indexOf('mw1-after'));
  });

  it('wraps non-AppError into MiddlewareChainError', async () => {
    const handler = chain([throwTypeError]);

    await expect(handler(mockRequest(), mockEvent())).rejects.toThrow(
      MiddlewareChainError,
    );
  });

  it('preserves the original error message in context', async () => {
    const handler = chain([throwOriginalFailure]);

    try {
      await handler(mockRequest(), mockEvent());
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(MiddlewareChainError);
      expect((error as MiddlewareChainError).context).toMatchObject({
        originalError: expect.stringMatching(/^.+$/),
      });
    }
  });

  it('re-throws AppError as-is without wrapping', async () => {
    const appError = new AppError(ErrorCode.UNKNOWN_ERROR, 'custom', 400);
    const failing: CustomMiddleware = async () => {
      throw appError;
    };

    const handler = chain([failing]);

    await expect(handler(mockRequest(), mockEvent())).rejects.toBe(appError);
  });

  it('logs error context with request metadata and traceId', async () => {
    const appError = new AppError(ErrorCode.UNKNOWN_ERROR, 'custom', 400);
    const failing: CustomMiddleware = async () => {
      throw appError;
    };
    const handler = chain([failing]);
    const req = mockRequest();
    const traceId = 'trace-123';
    req.headers.set('x-trace-id', traceId);

    await expect(handler(req, mockEvent())).rejects.toBe(appError);

    expect(logger.error).toHaveBeenCalledWith(appError.message, {
      err: appError,
      code: appError.code,
      statusCode: appError.statusCode,
      context: appError.context,
      url: req.url,
      method: req.method,
      pathname: req.nextUrl.pathname,
      traceId,
    });
  });

  it('throws when next() is called multiple times', async () => {
    const handler = chain([doubleNextMiddleware, passthroughMiddleware]);

    await expect(handler(mockRequest(), mockEvent())).rejects.toThrow(
      MiddlewareChainError,
    );
  });

  it('throws immediately on the second next() call, not from a deeper dispatch', async () => {
    const callOrder: string[] = [];
    const mw: CustomMiddleware = async (_req, _event, next) => {
      callOrder.push('before-first-next');
      await next();
      callOrder.push('before-second-next');
      return next();
    };

    const handler = chain([mw]);
    await expect(handler(mockRequest(), mockEvent())).rejects.toThrow(
      MiddlewareChainError,
    );
    expect(callOrder).toContain('before-second-next');
    expect(callOrder.indexOf('before-first-next')).toBeLessThan(
      callOrder.indexOf('before-second-next'),
    );
  });

  it('wraps the double-next Error into MiddlewareChainError', async () => {
    const handler = chain([doubleNextMiddleware, passthroughMiddleware]);

    try {
      await handler(mockRequest(), mockEvent());
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(MiddlewareChainError);
      expect((error as MiddlewareChainError).context).toMatchObject({
        originalError: expect.stringMatching(/^.+$/),
      });
    }
  });

  it('propagates request headers to the final NextResponse', async () => {
    const handler = chain([]);
    const req = mockRequest();
    req.headers.set('x-test', 'value');

    const response = await handler(req, mockEvent());

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('x-middleware-request-x-test')).toBe('value');
  });
});
