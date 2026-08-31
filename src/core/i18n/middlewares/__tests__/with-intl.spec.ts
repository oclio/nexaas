import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

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
    redirect: vi.fn(),
    rewrite: vi.fn(),
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
    it('sets x-locale from the existing x-locale header on /api routes', async () => {
      const request = mockRequest('/api/health', {
        headers: { 'x-locale': 'fr' },
      });

      await withIntl(request, mockEvent(), nextMock());

      expectLocaleHeader('fr');
      expect(intlMiddlewareMock).not.toHaveBeenCalled();
    });

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

    it('handles /trpc routes the same way as /api routes', async () => {
      const request = mockRequest('/trpc/example', {
        headers: { 'x-locale': 'fr' },
      });

      await withIntl(request, mockEvent(), nextMock());

      expectLocaleHeader('fr');
      expect(intlMiddlewareMock).not.toHaveBeenCalled();
    });
  });

  describe('non-api routes', () => {
    it('delegates to the next-intl middleware for regular routes', async () => {
      const intlResponse = {} as Response;
      intlMiddlewareMock.mockReturnValue(intlResponse);
      const request = mockRequest('/en/about');

      const response = await withIntl(request, mockEvent(), nextMock());

      expect(createMiddleware).toHaveBeenCalledOnce();
      expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
      expect(response).toBe(intlResponse);
      expect(nextResponseMock).not.toHaveBeenCalled();
    });

    it('does not modify request headers for regular routes', async () => {
      intlMiddlewareMock.mockReturnValue({} as Response);
      const request = mockRequest('/en/about');

      await withIntl(request, mockEvent(), nextMock());

      expect(request.headers.get('x-locale')).toBeNull();
    });
  });
});
