import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

vi.mock('@/core/observability/axiom/server', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@/core/observability/axiom/middlewares/with-axiom', () => ({
  withAxiom: async (
    _req: NextRequest,
    _event: NextFetchEvent,
    next: () => Promise<Response | NextResponse>,
  ) => next(),
}));

vi.mock('@/core/security/arcjet/middlewares/with-arcjet', () => ({
  withArcjet: async (
    _req: NextRequest,
    _event: NextFetchEvent,
    next: () => Promise<Response | NextResponse>,
  ) => next(),
}));

vi.mock('@/core/security/csp/middlewares/with-csp', () => ({
  withCsp: async (
    _req: NextRequest,
    _event: NextFetchEvent,
    next: () => Promise<Response | NextResponse>,
  ) => next(),
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
  it('returns a NextResponse when proxies run', async () => {
    const { proxy } = await import('@/proxy');
    const response = await proxy(mockRequest(), mockEvent());

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('is the default export', async () => {
    const { default: defaultExport, proxy } = await import('@/proxy');

    expect(defaultExport).toBe(proxy);
  });

  it('returns error response with traceId when chain throws', async () => {
    vi.resetModules();
    vi.doMock('@/core/observability/axiom/middlewares/with-axiom', () => ({
      withAxiom: async () => {
        throw new Error('middleware failed');
      },
    }));
    vi.doMock('@/core/security/arcjet/middlewares/with-arcjet', () => ({
      withArcjet: async (
        _req: NextRequest,
        _event: NextFetchEvent,
        next: () => Promise<Response | NextResponse>,
      ) => next(),
    }));
    vi.doMock('@/core/security/csp/middlewares/with-csp', () => ({
      withCsp: async (
        _req: NextRequest,
        _event: NextFetchEvent,
        next: () => Promise<Response | NextResponse>,
      ) => next(),
    }));

    const { proxy: failingProxy } = await import('@/proxy');
    const response = await failingProxy(
      mockRequest({ 'x-trace-id': 'trace-123' }),
      mockEvent(),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Internal Server Error');
    expect(body.traceId).toBe('trace-123');
  });

  it('returns error response with undefined traceId when header is missing', async () => {
    vi.resetModules();
    vi.doMock('@/core/observability/axiom/middlewares/with-axiom', () => ({
      withAxiom: async () => {
        throw new Error('middleware failed');
      },
    }));
    vi.doMock('@/core/security/arcjet/middlewares/with-arcjet', () => ({
      withArcjet: async (
        _req: NextRequest,
        _event: NextFetchEvent,
        next: () => Promise<Response | NextResponse>,
      ) => next(),
    }));
    vi.doMock('@/core/security/csp/middlewares/with-csp', () => ({
      withCsp: async (
        _req: NextRequest,
        _event: NextFetchEvent,
        next: () => Promise<Response | NextResponse>,
      ) => next(),
    }));

    const { proxy: failingProxy } = await import('@/proxy');
    const response = await failingProxy(mockRequest(), mockEvent());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.traceId).toBeUndefined();
  });

  it('uses statusCode from AppError when thrown', async () => {
    vi.resetModules();
    const { AppError, ErrorCode } = await import('@/core/errors');
    vi.doMock('@/core/observability/axiom/middlewares/with-axiom', () => ({
      withAxiom: async () => {
        throw new AppError(ErrorCode.UNKNOWN_ERROR, 'Bad request', 400);
      },
    }));
    vi.doMock('@/core/security/arcjet/middlewares/with-arcjet', () => ({
      withArcjet: async (
        _req: NextRequest,
        _event: NextFetchEvent,
        next: () => Promise<Response | NextResponse>,
      ) => next(),
    }));
    vi.doMock('@/core/security/csp/middlewares/with-csp', () => ({
      withCsp: async (
        _req: NextRequest,
        _event: NextFetchEvent,
        next: () => Promise<Response | NextResponse>,
      ) => next(),
    }));

    const { proxy: failingProxy } = await import('@/proxy');
    const response = await failingProxy(mockRequest(), mockEvent());

    expect(response.status).toBe(400);
  });

  it('defaults to 500 when a non-AppError is thrown', async () => {
    vi.resetModules();
    vi.doMock('@/core/observability/axiom/middlewares/with-axiom', () => ({
      withAxiom: async () => {
        throw new Error('middleware failed');
      },
    }));
    vi.doMock('@/core/security/arcjet/middlewares/with-arcjet', () => ({
      withArcjet: async (
        _req: NextRequest,
        _event: NextFetchEvent,
        next: () => Promise<Response | NextResponse>,
      ) => next(),
    }));
    vi.doMock('@/core/security/csp/middlewares/with-csp', () => ({
      withCsp: async (
        _req: NextRequest,
        _event: NextFetchEvent,
        next: () => Promise<Response | NextResponse>,
      ) => next(),
    }));

    const { proxy: failingProxy } = await import('@/proxy');
    const response = await failingProxy(mockRequest(), mockEvent());

    expect(response.status).toBe(500);
  });
});

describe('proxy config', () => {
  it('excludes _next, _vercel, monitoring, and files with dots', async () => {
    const { config } = await import('@/proxy');
    expect(config.matcher).toContain(
      '/((?!_next|_vercel|monitoring|api/web-vitals|.*\\..*).*)',
    );
  });

  it('includes api and trpc routes', async () => {
    const { config } = await import('@/proxy');
    expect(config.matcher).toContain('/(api|trpc)(.*)');
  });

  it('has exactly two matchers', async () => {
    const { config } = await import('@/proxy');
    expect(config.matcher).toHaveLength(2);
  });
});
