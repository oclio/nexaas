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

function setNodeEnvironment(value: string) {
  (process.env as { NODE_ENV: string }).NODE_ENV = value;
}

describe('withSecureCookies', () => {
  const originalNodeEnvironment = process.env.NODE_ENV;

  afterEach(() => {
    setNodeEnvironment(originalNodeEnvironment);
  });

  it('passes through when no cookies are set', async () => {
    const next = nextMockNoCookies();

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    expect(response.headers.get('set-cookie')).toBeNull();
    expect(next).toHaveBeenCalledOnce();
  });

  it.each([
    ['session=abc123', 'session=abc123; HttpOnly; SameSite=Strict; Path=/'],
    [
      'session=abc123; HttpOnly; SameSite=Strict; Path=/auth',
      'session=abc123; HttpOnly; SameSite=Strict; Path=/auth',
    ],
  ])('secures cookie %s', async (input, expected) => {
    const next = nextMockWithCookies([input]);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    expect(response.headers.get('set-cookie')).toBe(expected);
  });

  it.each([
    [
      'production',
      'session=abc123',
      'session=abc123; HttpOnly; SameSite=Strict; Path=/; Secure',
    ],
    [
      'production',
      'session=abc123; HttpOnly',
      'session=abc123; HttpOnly; SameSite=Strict; Path=/; Secure',
    ],
    [
      'development',
      'session=abc123',
      'session=abc123; HttpOnly; SameSite=Strict; Path=/',
    ],
    [
      'production',
      'session=abc123; Secure; HttpOnly',
      'session=abc123; Secure; HttpOnly; SameSite=Strict; Path=/',
    ],
  ])('handles Secure for %s with cookie %s', async (env, input, expected) => {
    setNodeEnvironment(env);
    const next = nextMockWithCookies([input]);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    expect(response.headers.get('set-cookie')).toBe(expected);
  });

  it('handles multiple cookies independently', async () => {
    const next = nextMockWithCookies([
      'session=abc123',
      'csrf=xyz789; HttpOnly',
    ]);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    const cookies = response.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toBe(
      'session=abc123; HttpOnly; SameSite=Strict; Path=/',
    );
    expect(cookies[1]).toBe('csrf=xyz789; HttpOnly; SameSite=Strict; Path=/');
  });

  it('preserves cookie attributes like Max-Age and Expires', async () => {
    const next = nextMockWithCookies([
      'session=abc123; Max-Age=3600; Expires=Wed, 21 Oct 2025 07:28:00 GMT',
    ]);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    expect(response.headers.get('set-cookie')).toBe(
      'session=abc123; Max-Age=3600; Expires=Wed, 21 Oct 2025 07:28:00 GMT; HttpOnly; SameSite=Strict; Path=/',
    );
  });

  it('trims whitespace around semicolons', async () => {
    const next = nextMockWithCookies([
      'session=abc123 ;  HttpOnly ;  SameSite=Strict ;  Path=/auth',
    ]);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    expect(response.headers.get('set-cookie')).toBe(
      'session=abc123; HttpOnly; SameSite=Strict; Path=/auth',
    );
  });

  it('splits multiple cookies separated by comma without space', async () => {
    const response = NextResponse.next();
    response.headers.set('set-cookie', 'a=1,b=2');
    const next = vi.fn().mockResolvedValue(response);

    const result = await withSecureCookies(mockRequest(), mockEvent(), next);

    const cookies = result.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toBe('a=1; HttpOnly; SameSite=Strict; Path=/');
    expect(cookies[1]).toBe('b=2; HttpOnly; SameSite=Strict; Path=/');
  });

  it('does not treat cookie name as an attribute', async () => {
    const next = nextMockWithCookies(['path_token=abc123']);

    const response = await withSecureCookies(mockRequest(), mockEvent(), next);

    expect(response.headers.get('set-cookie')).toBe(
      'path_token=abc123; HttpOnly; SameSite=Strict; Path=/',
    );
  });

  it.each([
    [
      'development',
      'session=abc123; PATH=/custom',
      'session=abc123; PATH=/custom; HttpOnly; SameSite=Strict',
    ],
    [
      'production',
      'session=abc123; secure',
      'session=abc123; secure; HttpOnly; SameSite=Strict; Path=/',
    ],
  ])(
    'matches attributes case-insensitively for %s with %s',
    async (env, input, expected) => {
      setNodeEnvironment(env);
      const next = nextMockWithCookies([input]);

      const response = await withSecureCookies(
        mockRequest(),
        mockEvent(),
        next,
      );

      expect(response.headers.get('set-cookie')).toBe(expected);
    },
  );
});
