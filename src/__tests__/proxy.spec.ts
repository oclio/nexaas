import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ErrorCode } from '@/core/errors';

async function passThrough(
  _req: NextRequest,
  _event: NextFetchEvent,
  next: () => Promise<Response | NextResponse>,
) {
  return next();
}

const { chainMock } = vi.hoisted(() => ({ chainMock: vi.fn() }));

vi.mock('@/core/middlewares/chain', () => ({
  chain: chainMock,
}));

vi.mock('@/core/i18n/middlewares/with-intl', () => ({
  withIntl: passThrough,
}));

vi.mock('@/core/observability/axiom/middlewares/with-axiom', () => ({
  withAxiom: passThrough,
}));

vi.mock('@/core/security/arcjet/middlewares/with-arcjet', () => ({
  withArcjet: passThrough,
}));

vi.mock('@/core/security/csp/middlewares/with-csp', () => ({
  withCsp: passThrough,
}));

vi.mock('@/core/security/csrf/middlewares/with-csrf', () => ({
  withCsrf: passThrough,
}));

vi.mock('@/core/security/body/middlewares/with-body-size-limit', () => ({
  withBodySizeLimit: passThrough,
}));

vi.mock('@/core/security/cookies/middlewares/with-secure-cookies', () => ({
  withSecureCookies: passThrough,
}));

function mockRequest(headers: Record<string, string> = {}): NextRequest {
  return {
    headers: new Headers(headers),
    url: 'http://localhost:3000/test',
    method: 'GET',
    nextUrl: { pathname: '/test' },
  } as unknown as NextRequest;
}

function mockEvent(): NextFetchEvent {
  return {} as unknown as NextFetchEvent;
}

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

  it('passes all proxies to chain in correct order', async () => {
    chainMock.mockReturnValue(async () => NextResponse.next());

    const { proxy } = await import('@/proxy');
    await proxy(mockRequest(), mockEvent());

    expect(chainMock).toHaveBeenCalledOnce();
    const passedProxies = chainMock.mock.calls[0][0];
    expect(passedProxies).toHaveLength(7);
    expect(passedProxies[0]).toBe(passThrough);
    expect(passedProxies[6]).toBe(passThrough);
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
