import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

vi.mock('@/core/config/env', () => ({
  env: {
    NEXT_PUBLIC_SENTRY_DSN: 'https://abc123@o123.ingest.sentry.io/456',
  },
}));

vi.mock('@/core/security/csp', () => ({
  buildCSP: vi.fn(
    (nonce: string | undefined, isDev: boolean, reportUri?: string) =>
      `csp:${nonce ?? 'none'}:${isDev}:${reportUri ?? 'no-report'}`,
  ),
}));

const { withCsp } = await import('../with-csp');
const { buildCSP } = await import('@/core/security/csp');

function mockRequest(pathname = '/test'): NextRequest {
  return {
    headers: new Headers(),
    nextUrl: { pathname },
  } as unknown as NextRequest;
}

function mockEvent(): NextFetchEvent {
  return {} as unknown as NextFetchEvent;
}

function nextMock() {
  return vi.fn().mockResolvedValue(NextResponse.next());
}

describe('withCsp', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets Content-Security-Policy header on response', async () => {
    const next = nextMock();

    const response = await withCsp(mockRequest(), mockEvent(), next);

    expect(response.headers.get('Content-Security-Policy')).toBeDefined();
    expect(buildCSP).toHaveBeenCalledOnce();
  });

  it('calls next and returns the response', async () => {
    const next = nextMock();

    const response = await withCsp(mockRequest(), mockEvent(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(response).toBeDefined();
  });

  it('generates a nonce for dynamic paths', async () => {
    const next = nextMock();
    const request = mockRequest('/dashboard');

    await withCsp(request, mockEvent(), next);

    expect(request.headers.get('x-nonce')).toBeDefined();
    const nonce = request.headers.get('x-nonce');
    expect(nonce).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });

  it('does not set nonce for non-dynamic paths', async () => {
    const next = nextMock();
    const request = mockRequest('/static-page');

    await withCsp(request, mockEvent(), next);

    expect(request.headers.get('x-nonce')).toBeNull();
  });

  it('passes isDevelopment=true when NODE_ENV is development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const next = nextMock();

    await withCsp(mockRequest(), mockEvent(), next);

    expect(buildCSP).toHaveBeenCalledWith(
      undefined,
      true,
      'https://sentry.io/api/456/security/?sentry_key=abc123',
    );
    vi.unstubAllEnvs();
  });

  it('passes isDevelopment=false when NODE_ENV is production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const next = nextMock();

    await withCsp(mockRequest(), mockEvent(), next);

    expect(buildCSP).toHaveBeenCalledWith(
      undefined,
      false,
      'https://sentry.io/api/456/security/?sentry_key=abc123',
    );
    vi.unstubAllEnvs();
  });

  it('sets Reporting-Endpoints header when Sentry DSN is configured', async () => {
    const next = nextMock();

    const response = await withCsp(mockRequest(), mockEvent(), next);

    expect(response.headers.get('Reporting-Endpoints')).toContain(
      'csp-endpoint',
    );
    expect(response.headers.get('Reporting-Endpoints')).toContain(
      'sentry.io/api/456/security/?sentry_key=abc123',
    );
  });

  it('does not set Reporting-Endpoints when Sentry DSN is not configured', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { NEXT_PUBLIC_SENTRY_DSN: undefined },
    }));
    const { withCsp: cspWithoutSentry } = await import('../with-csp');
    const next = nextMock();

    const response = await cspWithoutSentry(mockRequest(), mockEvent(), next);

    expect(response.headers.get('Reporting-Endpoints')).toBeNull();
  });

  it('handles invalid Sentry DSN gracefully', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { NEXT_PUBLIC_SENTRY_DSN: 'not-a-valid-url' },
    }));
    const { withCsp: cspInvalidDsn } = await import('../with-csp');
    const next = nextMock();

    const response = await cspInvalidDsn(mockRequest(), mockEvent(), next);

    expect(response.headers.get('Reporting-Endpoints')).toBeNull();
    expect(response.headers.get('Content-Security-Policy')).toBeDefined();
  });

  it('matches dynamic paths by prefix', async () => {
    const next = nextMock();
    const request = mockRequest('/dashboard/settings');

    await withCsp(request, mockEvent(), next);

    expect(request.headers.get('x-nonce')).toBeDefined();
  });
});
