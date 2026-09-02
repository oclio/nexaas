import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';

vi.mock('@/core/security/csp', () => ({
  buildCSP: vi.fn(
    (nonce: string | undefined, isDev: boolean, reportUri?: string) =>
      `csp:${nonce ?? 'none'}:${isDev}:${reportUri ?? 'no-report'}`,
  ),
}));

import { buildCSP } from '@/core/security/csp';

import { withCsp } from '../with-csp';

const SENTRY_DSN = 'https://abc123@o123.ingest.sentry.io/456';
const SENTRY_REPORT_URL =
  'https://sentry.io/api/456/security/?sentry_key=abc123';

function mockRequest(pathname = '/test'): NextRequest {
  return mockNextRequest({ pathname });
}

const mockEvent = mockNextFetchEvent;

function nextMock() {
  return vi.fn().mockResolvedValue(NextResponse.next());
}

describe('withCsp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', SENTRY_DSN);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sets Content-Security-Policy header on response', async () => {
    const next = nextMock();

    const response = await withCsp(mockRequest(), mockEvent(), next);

    expect(response.headers.get('Content-Security-Policy')).toBeDefined();
    expect(buildCSP).toHaveBeenCalled();
  });

  it('calls next and returns the response', async () => {
    const next = nextMock();

    const response = await withCsp(mockRequest(), mockEvent(), next);

    expect(next).toHaveBeenCalled();
    expect(response).toBeDefined();
  });

  it('generates a nonce for dynamic paths', async () => {
    const next = nextMock();
    const request = mockRequest('/dashboard');

    await withCsp(request, mockEvent(), next);

    const nonce = request.headers.get('x-nonce');
    expect(nonce).not.toBeNull();
    expect(nonce).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    // UUID sans dashes = 32 chars → btoa = 44 chars
    expect(nonce).toHaveLength(44);
  });

  it('does not set nonce for non-dynamic paths', async () => {
    const next = nextMock();
    const request = mockRequest('/static-page');

    await withCsp(request, mockEvent(), next);

    expect(request.headers.get('x-nonce')).toBeNull();
  });

  it('does not set nonce for paths ending with but not starting with a dynamic path', async () => {
    const next = nextMock();
    const request = mockRequest('/foo/dashboard');

    await withCsp(request, mockEvent(), next);

    expect(request.headers.get('x-nonce')).toBeNull();
  });

  it('passes isDevelopment=true when NODE_ENV is development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const next = nextMock();

    await withCsp(mockRequest(), mockEvent(), next);

    expect(buildCSP).toHaveBeenCalledWith(undefined, true, SENTRY_REPORT_URL);
  });

  it('passes isDevelopment=false when NODE_ENV is production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const next = nextMock();

    await withCsp(mockRequest(), mockEvent(), next);

    expect(buildCSP).toHaveBeenCalledWith(undefined, false, SENTRY_REPORT_URL);
  });

  it('sets Reporting-Endpoints header when Sentry DSN is configured', async () => {
    const next = nextMock();

    const response = await withCsp(mockRequest(), mockEvent(), next);

    expect(response.headers.get('Reporting-Endpoints')).toContain(
      'csp-endpoint',
    );
    expect(response.headers.get('Reporting-Endpoints')).toContain(
      SENTRY_REPORT_URL,
    );
  });

  it('does not set Reporting-Endpoints when Sentry DSN is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
    const next = nextMock();

    const response = await withCsp(mockRequest(), mockEvent(), next);

    expect(response.headers.get('Reporting-Endpoints')).toBeNull();
  });

  it('handles invalid Sentry DSN gracefully', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'not-a-valid-url');
    const next = nextMock();

    const response = await withCsp(mockRequest(), mockEvent(), next);

    expect(response.headers.get('Reporting-Endpoints')).toBeNull();
    expect(response.headers.get('Content-Security-Policy')).toBeDefined();
  });

  it('matches dynamic paths by prefix', async () => {
    const next = nextMock();
    const request = mockRequest('/dashboard/settings');

    await withCsp(request, mockEvent(), next);

    expect(request.headers.get('x-nonce')).not.toBeNull();
  });
});
