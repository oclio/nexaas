import type { NextRequest } from 'next/server';

import { routing } from '@/core/i18n/routing';
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

const [defaultLocale, nonDefaultLocale] = routing.locales;

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
          headers: { 'x-locale': nonDefaultLocale },
        });
        const next = createNextMock();

        const response = await withIntl(request, mockEvent(), next);

        expect(next).toHaveBeenCalled();
        expect(request.headers.get('x-locale')).toBe(nonDefaultLocale);
        expect(response.headers.get('x-locale')).toBe(nonDefaultLocale);
        expect(intlMiddlewareMock).not.toHaveBeenCalled();
      },
    );

    it.each<{
      name: string;
      headers: Record<string, string>;
      cookies: Record<string, string>;
      expected: string;
    }>([
      {
        name: 'from NEXT_LOCALE cookie when header is missing',
        headers: {},
        cookies: { NEXT_LOCALE: nonDefaultLocale },
        expected: nonDefaultLocale,
      },
      {
        name: 'to the default locale when neither header nor cookie is present',
        headers: {},
        cookies: {},
        expected: defaultLocale,
      },
      {
        name: 'preferring the x-locale header over the NEXT_LOCALE cookie',
        headers: { 'x-locale': defaultLocale },
        cookies: { NEXT_LOCALE: nonDefaultLocale },
        expected: defaultLocale,
      },
    ])('sets x-locale $name', async ({ headers, cookies, expected }) => {
      const request = mockRequest('/api/data', { headers, cookies });
      const next = createNextMock();

      const response = await withIntl(request, mockEvent(), next);

      expect(next).toHaveBeenCalled();
      expect(request.headers.get('x-locale')).toBe(expected);
      expect(response.headers.get('x-locale')).toBe(expected);
    });
  });

  describe('non-api routes', () => {
    it.each([
      { pathname: `/${defaultLocale}/about`, expectedLocale: defaultLocale },
      { pathname: '/about', expectedLocale: defaultLocale },
      {
        pathname: `/${nonDefaultLocale}/about`,
        expectedLocale: nonDefaultLocale,
      },
      { pathname: '/', expectedLocale: defaultLocale },
      { pathname: '/xyz/about', expectedLocale: defaultLocale },
    ])(
      'sets x-locale to $expectedLocale for $pathname and calls next',
      async ({ pathname, expectedLocale }) => {
        intlMiddlewareMock.mockReturnValue({
          headers: new Headers({ 'x-intl-merged': 'true' }),
          status: 200,
        } as Response);
        const request = mockRequest(pathname);
        const next = createNextMock(new Headers({ 'x-trace-id': 'abc' }));

        const response = await withIntl(request, mockEvent(), next);

        expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
        expect(next).toHaveBeenCalled();
        expect(response.headers.get('x-locale')).toBe(expectedLocale);
        expect(response.headers.get('x-trace-id')).toBe('abc');
        expect(response.headers.get('x-intl-merged')).toBe('true');
      },
    );

    it('calls next and merges headers when next-intl returns a non-redirect status', async () => {
      intlMiddlewareMock.mockReturnValue({
        headers: new Headers(),
        status: 201,
      } as Response);
      const request = mockRequest(`/${defaultLocale}`);
      const next = createNextMock(new Headers({ 'x-trace-id': 'abc' }));

      const response = await withIntl(request, mockEvent(), next);

      expect(next).toHaveBeenCalled();
      expect(response.headers.get('x-trace-id')).toBe('abc');
      expect(response.headers.get('x-locale')).toBe(defaultLocale);
    });

    it('returns redirect response directly without calling next when next-intl redirects', async () => {
      intlMiddlewareMock.mockReturnValue({
        headers: new Headers({ location: `/${defaultLocale}` }),
        status: 307,
      } as Response);
      const request = mockRequest('/');
      const next = createNextMock();

      const response = await withIntl(request, mockEvent(), next);

      expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
      expect(next).not.toHaveBeenCalled();
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(`/${defaultLocale}`);
      expect(response.headers.get('x-locale')).toBe(defaultLocale);
    });

    it.each([
      { status: 300, shouldRedirect: true },
      { status: 400, shouldRedirect: false },
    ])(
      'treats status $status as $shouldRedirect redirect',
      async ({ status, shouldRedirect }) => {
        intlMiddlewareMock.mockReturnValue({
          headers: new Headers(
            shouldRedirect ? { location: `/${defaultLocale}` } : {},
          ),
          status,
        } as Response);
        const request = mockRequest('/');
        const next = createNextMock(new Headers({ 'x-trace-id': 'abc' }));

        const response = await withIntl(request, mockEvent(), next);

        if (shouldRedirect) {
          expect(next).not.toHaveBeenCalled();
          expect(response.status).toBe(status);
        } else {
          expect(next).toHaveBeenCalled();
          expect(response.headers.get('x-trace-id')).toBe('abc');
        }
      },
    );
  });
});
