import { NextResponse } from 'next/server';

import { ErrorCode } from '@/core/errors';
import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';

const { chainMock } = vi.hoisted(() => ({ chainMock: vi.fn() }));

vi.mock('@/core/middlewares/chain', () => ({
  chain: chainMock,
}));

vi.mock('@/proxy-stack', () => ({
  default: [],
}));

const mockRequest = (headers: Record<string, string> = {}) =>
  mockNextRequest({ headers });
const mockEvent = mockNextFetchEvent;

describe('proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns a NextResponse when handler succeeds', async () => {
    const successResponse = NextResponse.next();
    chainMock.mockReturnValue(async () => successResponse);

    const { proxy } = await import('@/proxy');
    const response = await proxy(mockRequest(), mockEvent());

    expect(response).toBe(successResponse);
  });

  it('is the default export', async () => {
    const { default: defaultExport, proxy } = await import('@/proxy');

    expect(defaultExport).toBe(proxy);
  });

  it('returns error response with traceId when handler throws', async () => {
    chainMock.mockReturnValue(async () => {
      throw new Error('middleware failed');
    });

    const { proxy } = await import('@/proxy');
    const response = await proxy(
      mockRequest({ 'x-trace-id': 'trace-123' }),
      mockEvent(),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Internal Server Error');
    expect(body.traceId).toBe('trace-123');
  });

  it('returns error response with undefined traceId when header is missing', async () => {
    chainMock.mockReturnValue(async () => {
      throw new Error('middleware failed');
    });

    const { proxy } = await import('@/proxy');
    const response = await proxy(mockRequest(), mockEvent());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.traceId).toBeUndefined();
  });

  it('uses statusCode from AppError when thrown', async () => {
    const { AppError } = await import('@/core/errors');
    chainMock.mockReturnValue(async () => {
      throw new AppError(ErrorCode.UNKNOWN_ERROR, 'Bad request', 400);
    });

    const { proxy } = await import('@/proxy');
    const response = await proxy(
      mockRequest({ 'x-trace-id': 'trace-456' }),
      mockEvent(),
    );

    expect(response.status).toBe(400);
  });

  it('defaults to 500 when a non-AppError is thrown', async () => {
    chainMock.mockReturnValue(async () => {
      throw new TypeError('plain error');
    });

    const { proxy } = await import('@/proxy');
    const response = await proxy(mockRequest(), mockEvent());

    expect(response.status).toBe(500);
  });

  it('passes the stack to chain', async () => {
    chainMock.mockReturnValue(async () => NextResponse.next());

    const { proxy } = await import('@/proxy');
    await proxy(mockRequest(), mockEvent());

    expect(chainMock).toHaveBeenCalledOnce();
    expect(chainMock.mock.calls[0][0]).toBeTruthy();
  });
});

describe('proxy config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('excludes _next, _vercel, monitoring, and files with dots', async () => {
    const { config } = await import('@/proxy');

    expect(config.matcher).toStrictEqual([
      '/((?!_next|_vercel|monitoring|api/web-vitals|.*\\..*).*)',
      '/(api|trpc)(.*)',
    ]);
  });

  it('includes api and trpc routes', async () => {
    const { config } = await import('@/proxy');

    expect(config.matcher[1]).toBe('/(api|trpc)(.*)');
  });

  it('has exactly two matchers', async () => {
    const { config } = await import('@/proxy');

    expect(config.matcher).toHaveLength(2);
  });
});
