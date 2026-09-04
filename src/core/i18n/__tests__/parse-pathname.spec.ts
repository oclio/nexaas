import { parsePathname } from '@/core/i18n/parse-pathname';
import { routing } from '@/core/i18n/routing';

describe('parsePathname', () => {
  it.each([
    { pathname: '/', expectedLocale: routing.defaultLocale, expectedPath: '/' },
    { pathname: '/en', expectedLocale: 'en', expectedPath: '/' },
    { pathname: '/fr', expectedLocale: 'fr', expectedPath: '/' },
    { pathname: '/en/faq', expectedLocale: 'en', expectedPath: '/faq' },
    { pathname: '/fr/faq', expectedLocale: 'fr', expectedPath: '/faq' },
    {
      pathname: '/en/what-is-included',
      expectedLocale: 'en',
      expectedPath: '/what-is-included',
    },
    {
      pathname: '/about',
      expectedLocale: routing.defaultLocale,
      expectedPath: '/about',
    },
    {
      pathname: '/xyz/about',
      expectedLocale: routing.defaultLocale,
      expectedPath: '/xyz/about',
    },
  ])(
    'parses $pathname into locale $expectedLocale and path $expectedPath',
    ({ pathname, expectedLocale, expectedPath }) => {
      const result = parsePathname(pathname);

      expect(result).toMatchObject({
        locale: expectedLocale,
        path: expectedPath,
      });
    },
  );

  it('returns default locale and root path for null pathname', () => {
    const result = parsePathname(null);

    expect(result).toMatchObject({
      locale: routing.defaultLocale,
      path: '/',
    });
  });
});
