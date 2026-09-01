import type { NextRequest } from 'next/server';

import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';

import { withIntl } from '../with-intl';

const { intlMiddlewareMock, nextResponseMock } = vi.hoisted(() => ({
  intlMiddlewareMock: vi.fn(),
  nextResponseMock: vi.fn(),
}));

vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => intlMiddlewareMock),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    next: nextResponseMock,
  },
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

function nextMock() {
  return vi.fn().mockResolvedValue({} as Response);
}

function expectLocaleHeader(value: string) {
  expect(nextResponseMock).toHaveBeenCalledOnce();
  const argument = nextResponseMock.mock.calls[0][0] as {
    request: { headers: Headers };
  };
  expect(argument.request.headers.get('x-locale')).toBe(value);
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

        await withIntl(request, mockEvent(), nextMock());

        expectLocaleHeader('fr');
        expect(intlMiddlewareMock).not.toHaveBeenCalled();
      },
    );

    it('sets x-locale from the NEXT_LOCALE cookie when header is missing', async () => {
      const request = mockRequest('/api/users', {
        cookies: { NEXT_LOCALE: 'fr' },
      });

      await withIntl(request, mockEvent(), nextMock());

      expectLocaleHeader('fr');
    });

    it('falls back to the default locale when neither header nor cookie is present', async () => {
      const request = mockRequest('/api/data');

      await withIntl(request, mockEvent(), nextMock());

      expectLocaleHeader('en');
    });

    it('prefers the x-locale header over the NEXT_LOCALE cookie', async () => {
      const request = mockRequest('/api/health', {
        headers: { 'x-locale': 'en' },
        cookies: { NEXT_LOCALE: 'fr' },
      });

      await withIntl(request, mockEvent(), nextMock());

      expectLocaleHeader('en');
    });
  });

  describe('non-api routes', () => {
    it.each([
      { pathname: '/en/about', expectedLocale: 'en' },
      { pathname: '/about', expectedLocale: 'en' },
      { pathname: '/fr/about', expectedLocale: 'fr' },
      { pathname: '/', expectedLocale: 'en' },
    ])(
      'sets x-locale to $expectedLocale for $pathname',
      async ({ pathname, expectedLocale }) => {
        const responseHeaders = new Headers();
        intlMiddlewareMock.mockReturnValue({
          headers: responseHeaders,
        } as Response);
        const request = mockRequest(pathname);

        await withIntl(request, mockEvent(), nextMock());

        expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
        expect(responseHeaders.get('x-locale')).toBe(expectedLocale);
      },
    );
  });
});
