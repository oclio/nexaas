import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { AppError } from '@/core/errors/app-error';
import { ErrorCode } from '@/core/errors/codes';
import { chain } from '@/core/middlewares/chain';
import { MiddlewareChainError } from '@/core/middlewares/errors/middleware-chain-error';
import type { CustomMiddleware } from '@/core/middlewares/types';
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

    expect(order).toEqual([
      'mw1-before',
      'mw2-before',
      'mw3',
      'mw2-after',
      'mw1-after',
    ]);
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
      expect((error as MiddlewareChainError).context).toEqual({
        originalError: 'original failure',
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

  it('throws when next() is called multiple times', async () => {
    const handler = chain([doubleNextMiddleware, passthroughMiddleware]);

    await expect(handler(mockRequest(), mockEvent())).rejects.toThrow(
      MiddlewareChainError,
    );
  });

  it('wraps the double-next Error into MiddlewareChainError', async () => {
    const handler = chain([doubleNextMiddleware, passthroughMiddleware]);

    try {
      await handler(mockRequest(), mockEvent());
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(MiddlewareChainError);
      expect((error as MiddlewareChainError).context).toEqual({
        originalError: 'next() called multiple times',
      });
    }
  });

  it('propagates request headers to the final NextResponse', async () => {
    const handler = chain([]);
    const req = mockRequest();
    req.headers.set('x-test', 'value');

    const response = await handler(req, mockEvent());

    expect(response).toBeInstanceOf(NextResponse);
  });
});
