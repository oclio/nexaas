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

  it.each<{
    errorType: string;
    headers: Record<string, string>;
    expectedStatus: number;
    expectedTraceId: string | undefined;
  }>([
    {
      errorType: 'Error',
      headers: { 'x-trace-id': 'trace-123' },
      expectedStatus: 500,
      expectedTraceId: 'trace-123',
    },
    {
      errorType: 'Error',
      headers: {},
      expectedStatus: 500,
      expectedTraceId: undefined,
    },
    {
      errorType: 'Error',
      headers: { 'x-trace-id': '' },
      expectedStatus: 500,
      expectedTraceId: undefined,
    },
    {
      errorType: 'AppError',
      headers: { 'x-trace-id': 'trace-456' },
      expectedStatus: 400,
      expectedTraceId: 'trace-456',
    },
    {
      errorType: 'TypeError',
      headers: {},
      expectedStatus: 500,
      expectedTraceId: undefined,
    },
  ])(
    'returns $expectedStatus with $expectedTraceId traceId when handler throws $errorType',
    async ({ errorType, headers, expectedStatus, expectedTraceId }) => {
      const { AppError } = await import('@/core/errors');
      const errorBuilders: Record<string, () => Error> = {
        AppError: () =>
          new AppError(ErrorCode.UNKNOWN_ERROR, 'Bad request', 400),
        TypeError: () => new TypeError('plain error'),
        Error: () => new Error('middleware failed'),
      };
      const error = errorBuilders[errorType]();

      chainMock.mockReturnValue(async () => {
        throw error;
      });

      const { proxy } = await import('@/proxy');
      const response = await proxy(mockRequest(headers), mockEvent());
      const body = await response.json();

      expect(response.status).toBe(expectedStatus);
      expect(body.error).toBe('Internal Server Error');
      expect(body.traceId).toBe(expectedTraceId);
    },
  );

  it('passes the stack to chain', async () => {
    chainMock.mockReturnValue(async () => NextResponse.next());

    const { proxy } = await import('@/proxy');
    await proxy(mockRequest(), mockEvent());

    expect(chainMock).toHaveBeenCalled();
    expect(Array.isArray(chainMock.mock.calls[0][0])).toBe(true);
  });

  it('sets x-pathname on the request and response', async () => {
    const handler = vi.fn(async () => NextResponse.next());
    chainMock.mockReturnValue(handler);

    const { proxy } = await import('@/proxy');
    const request = mockNextRequest({ pathname: '/en/about' });
    const response = await proxy(request, mockEvent());

    expect(request.headers.get('x-pathname')).toBe('/en/about');
    expect(response.headers.get('x-pathname')).toBe('/en/about');
  });
});

describe('proxy config', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('excludes _next, _vercel, monitoring, and files with dots', async () => {
    const { config } = await import('@/proxy');
    const matcher = config.matcher[0] as string;

    expect(matcher).toContain('_next');
    expect(matcher).toContain('_vercel');
    expect(matcher).toContain('monitoring');
    expect(matcher).toContain('\\.');
  });

  it('includes api and trpc routes in matchers', async () => {
    const { config } = await import('@/proxy');

    expect(
      config.matcher.some(
        (m) => typeof m === 'string' && m.includes('api') && m.includes('trpc'),
      ),
    ).toBe(true);
  });
});
