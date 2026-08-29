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

const { config, proxy } = await import('@/proxy');

function mockRequest(): NextRequest {
  return {
    headers: new Headers(),
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
    const response = await proxy(mockRequest(), mockEvent());

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('is the default export', async () => {
    const { default: defaultExport } = await import('@/proxy');

    expect(defaultExport).toBe(proxy);
  });
});

describe('proxy config', () => {
  it('excludes _next, _vercel, monitoring, and files with dots', () => {
    expect(config.matcher).toContain(
      '/((?!_next|_vercel|monitoring|api/web-vitals|.*\\..*).*)',
    );
  });

  it('includes api and trpc routes', () => {
    expect(config.matcher).toContain('/(api|trpc)(.*)');
  });

  it('has exactly two matchers', () => {
    expect(config.matcher).toHaveLength(2);
  });
});
