import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';

const { withSecureCookies } = await import('../with-secure-cookies');

const mockRequest = (): NextRequest => mockNextRequest();
const mockEvent = mockNextFetchEvent;

function nextMockWithCookies(cookies: string[]): () => Promise<NextResponse> {
  const response = NextResponse.next();
  for (const cookie of cookies) {
    response.headers.append('set-cookie', cookie);
  }
  return vi.fn().mockResolvedValue(response);
}

function nextMockNoCookies(): () => Promise<NextResponse> {
  return vi.fn().mockResolvedValue(NextResponse.next());
}

describe('withSecureCookies', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passes through when no cookies are set', async () => {
    const next = nextMockNoCookies();

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    expect(response.headers.get('set-cookie')).toBeNull();
    expect(next).toHaveBeenCalledOnce();
  });

  it('adds HttpOnly, SameSite=Strict, and Path=/ to a bare cookie', async () => {
    const next = nextMockWithCookies(['session=abc123']);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    const cookie = response.headers.get('set-cookie');
    expect(cookie).toContain('session=abc123');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Path=/');
  });

  it('does not duplicate attributes already present', async () => {
    const next = nextMockWithCookies([
      'session=abc123; HttpOnly; SameSite=Strict; Path=/auth',
    ]);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    const cookie = response.headers.get('set-cookie') ?? '';
    const httpOnlyCount = (cookie.match(/HttpOnly/gi) ?? []).length;
    const sameSiteCount = (cookie.match(/SameSite=Strict/gi) ?? []).length;
    expect(httpOnlyCount).toBe(1);
    expect(sameSiteCount).toBe(1);
    expect(cookie).toContain('Path=/auth');
  });

  it('adds Secure in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const next = nextMockWithCookies(['session=abc123']);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    expect(response.headers.get('set-cookie')).toContain('Secure');
  });

  it('does not add Secure in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const next = nextMockWithCookies(['session=abc123']);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    expect(response.headers.get('set-cookie')).not.toContain('Secure');
  });

  it('does not duplicate Secure when already present', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const next = nextMockWithCookies(['session=abc123; Secure; HttpOnly']);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    const cookie = response.headers.get('set-cookie') ?? '';
    const secureCount = (cookie.match(/Secure/gi) ?? []).length;
    expect(secureCount).toBe(1);
  });

  it('handles multiple cookies independently', async () => {
    const next = nextMockWithCookies([
      'session=abc123',
      'csrf=xyz789; HttpOnly',
    ]);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    const cookies = response.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toContain('session=abc123');
    expect(cookies[0]).toContain('HttpOnly');
    expect(cookies[1]).toContain('csrf=xyz789');
    expect(cookies[1]).toContain('SameSite=Strict');
  });

  it('preserves cookie attributes like Max-Age and Expires', async () => {
    const next = nextMockWithCookies([
      'session=abc123; Max-Age=3600; Expires=Wed, 21 Oct 2025 07:28:00 GMT',
    ]);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).toContain('Max-Age=3600');
    expect(cookie).toContain('Expires=Wed, 21 Oct 2025 07:28:00 GMT');
    expect(cookie).toContain('HttpOnly');
  });
});
