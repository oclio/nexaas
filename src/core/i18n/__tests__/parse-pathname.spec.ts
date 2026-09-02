import { parsePathname } from '@/core/i18n/parse-pathname';

describe('parsePathname', () => {
  it.each([
    { pathname: '/', expectedLocale: 'en', expectedPath: '/' },
    { pathname: '/en', expectedLocale: 'en', expectedPath: '/' },
    { pathname: '/fr', expectedLocale: 'fr', expectedPath: '/' },
    { pathname: '/en/faq', expectedLocale: 'en', expectedPath: '/faq' },
    { pathname: '/fr/faq', expectedLocale: 'fr', expectedPath: '/faq' },
    {
      pathname: '/en/what-is-included',
      expectedLocale: 'en',
      expectedPath: '/what-is-included',
    },
    { pathname: '/about', expectedLocale: 'en', expectedPath: '/about' },
    {
      pathname: '/xyz/about',
      expectedLocale: 'en',
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
});
