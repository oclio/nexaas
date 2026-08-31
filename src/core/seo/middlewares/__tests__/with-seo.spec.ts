import { NextResponse } from 'next/server';

import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';

import { withSeo } from '../with-seo';

const nextMock = () => vi.fn().mockResolvedValue(NextResponse.next());

describe('withSeo', () => {
  it.each([
    ['/en', 'en', ''],
    ['/fr/login', 'fr', '/login'],
    ['/en/blog/my-post', 'en', '/blog/my-post'],
    ['/login', 'en', '/login'],
    ['/', 'en', ''],
  ])(
    'sets x-locale and x-path for %s',
    async (pathname, expectedLocale, expectedPath) => {
      const request = mockNextRequest({
        pathname,
        url: `http://localhost:3000${pathname}`,
      });
      const next = nextMock();

      const response = await withSeo(request, mockNextFetchEvent(), next);

      expect(response.headers.get('x-locale')).toBe(expectedLocale);
      expect(response.headers.get('x-path')).toBe(expectedPath);
    },
  );

  it('calls next middleware', async () => {
    const request = mockNextRequest({
      pathname: '/en',
      url: 'http://localhost:3000/en',
    });
    const next = nextMock();

    await withSeo(request, mockNextFetchEvent(), next);

    expect(next).toHaveBeenCalledOnce();
  });
});
