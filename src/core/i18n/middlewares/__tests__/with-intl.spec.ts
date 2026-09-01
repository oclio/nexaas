import type { NextRequest } from 'next/server';

import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';

import { withIntl } from '../with-intl';

const { intlMiddlewareMock } = vi.hoisted(() => ({
  intlMiddlewareMock: vi.fn(),
}));

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => intlMiddlewareMock),
}));

function mockRequest(
  pathname: string,
  options: {
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {},
): NextRequest {
  return mockNextRequest({ pathname, ...options });
}

const mockEvent = mockNextFetchEvent;

function createNextMock(headers = new Headers()) {
  const response = {
    headers,
    status: 200,
  } as Response;
  return vi.fn().mockResolvedValue(response);
}

describe('withIntl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('api and trpc routes', () => {
    it.each(['/api/health', '/trpc/example'])(
      'sets x-locale from the existing x-locale header on %s routes',
      async (pathname) => {
        const request = mockRequest(pathname, {
          headers: { 'x-locale': 'fr' },
        });
        const next = createNextMock();

        const response = await withIntl(request, mockEvent(), next);

        expect(next).toHaveBeenCalledOnce();
        expect(request.headers.get('x-locale')).toBe('fr');
        expect(response.headers.get('x-locale')).toBe('fr');
        expect(intlMiddlewareMock).not.toHaveBeenCalled();
      },
    );

    it('sets x-locale from the NEXT_LOCALE cookie when header is missing', async () => {
      const request = mockRequest('/api/users', {
        cookies: { NEXT_LOCALE: 'fr' },
      });
      const next = createNextMock();

      const response = await withIntl(request, mockEvent(), next);

      expect(next).toHaveBeenCalledOnce();
      expect(request.headers.get('x-locale')).toBe('fr');
      expect(response.headers.get('x-locale')).toBe('fr');
    });

    it('falls back to the default locale when neither header nor cookie is present', async () => {
      const request = mockRequest('/api/data');
      const next = createNextMock();

      const response = await withIntl(request, mockEvent(), next);

      expect(next).toHaveBeenCalledOnce();
      expect(request.headers.get('x-locale')).toBe('en');
      expect(response.headers.get('x-locale')).toBe('en');
    });

    it('prefers the x-locale header over the NEXT_LOCALE cookie', async () => {
      const request = mockRequest('/api/health', {
        headers: { 'x-locale': 'en' },
        cookies: { NEXT_LOCALE: 'fr' },
      });
      const next = createNextMock();

      const response = await withIntl(request, mockEvent(), next);

      expect(next).toHaveBeenCalledOnce();
      expect(request.headers.get('x-locale')).toBe('en');
      expect(response.headers.get('x-locale')).toBe('en');
    });
  });

  describe('non-api routes', () => {
    it.each([
      { pathname: '/en/about', expectedLocale: 'en' },
      { pathname: '/about', expectedLocale: 'en' },
      { pathname: '/fr/about', expectedLocale: 'fr' },
      { pathname: '/', expectedLocale: 'en' },
      { pathname: '/xyz/about', expectedLocale: 'en' },
    ])(
      'sets x-locale to $expectedLocale for $pathname and calls next',
      async ({ pathname, expectedLocale }) => {
        intlMiddlewareMock.mockReturnValue({
          headers: new Headers({ 'x-middleware-rewrite': '/en/about' }),
          status: 200,
        } as Response);
        const request = mockRequest(pathname);
        const next = createNextMock(new Headers({ 'x-trace-id': 'abc' }));

        const response = await withIntl(request, mockEvent(), next);

        expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
        expect(next).toHaveBeenCalledOnce();
        expect(response.headers.get('x-locale')).toBe(expectedLocale);
        expect(response.headers.get('x-trace-id')).toBe('abc');
        expect(response.headers.get('x-middleware-rewrite')).toBe('/en/about');
      },
    );

    it('calls next and merges headers when next-intl returns a non-redirect status', async () => {
      intlMiddlewareMock.mockReturnValue({
        headers: new Headers(),
        status: 201,
      } as Response);
      const request = mockRequest('/en');
      const next = createNextMock(new Headers({ 'x-trace-id': 'abc' }));

      const response = await withIntl(request, mockEvent(), next);

      expect(next).toHaveBeenCalledOnce();
      expect(response.headers.get('x-trace-id')).toBe('abc');
      expect(response.headers.get('x-locale')).toBe('en');
    });

    it('returns redirect response directly without calling next when next-intl redirects', async () => {
      intlMiddlewareMock.mockReturnValue({
        headers: new Headers({ location: '/en' }),
        status: 307,
      } as Response);
      const request = mockRequest('/');
      const next = createNextMock();

      const response = await withIntl(request, mockEvent(), next);

      expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
      expect(next).not.toHaveBeenCalled();
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('/en');
      expect(response.headers.get('x-locale')).toBe('en');
    });

    it.each([
      { status: 300, shouldRedirect: true },
      { status: 400, shouldRedirect: false },
    ])(
      'treats status $status as $shouldRedirect redirect',
      async ({ status, shouldRedirect }) => {
        intlMiddlewareMock.mockReturnValue({
          headers: new Headers(shouldRedirect ? { location: '/en' } : {}),
          status,
        } as Response);
        const request = mockRequest('/');
        const next = createNextMock(new Headers({ 'x-trace-id': 'abc' }));

        const response = await withIntl(request, mockEvent(), next);

        if (shouldRedirect) {
          expect(next).not.toHaveBeenCalled();
          expect(response.status).toBe(status);
        } else {
          expect(next).toHaveBeenCalledOnce();
          expect(response.headers.get('x-trace-id')).toBe('abc');
        }
      },
    );
  });
});
