import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { env } from '@/core/env';
import { routing, supportedLocales } from '@/core/i18n/routing';
import { translationMock } from '@/tests/unit/mocks/intl';

import { createPageMetadata } from '../create-page-metadata';

type OgWebsite = Extract<
  NonNullable<Metadata['openGraph']>,
  { type: 'website' }
>;
type TwitterCard = Extract<
  NonNullable<Metadata['twitter']>,
  { card: 'summary_large_image' }
>;

const mockHeaders = (locale: string | null, pathname: string | null) => {
  const headersList = new Headers();
  if (locale) headersList.set('x-locale', locale);
  if (pathname) headersList.set('x-pathname', pathname);

  vi.mocked(headers).mockResolvedValue(headersList);
};

describe('createPageMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(['title', 'description'] as const)(
    'returns the translated %s without suffix',
    async (field) => {
      mockHeaders('en', null);

      const metadata = await createPageMetadata('pages.landing');

      expect(metadata[field]).toBe(translationMock(field));
    },
  );

  it('passes locale and namespace to getTranslations', async () => {
    mockHeaders('fr', null);

    await createPageMetadata('pages.landing');

    expect(getTranslations).toHaveBeenCalledWith({
      locale: 'fr',
      namespace: 'pages.landing',
    });
  });

  it('defaults locale to routing.defaultLocale when header is missing', async () => {
    mockHeaders(null, null);

    await createPageMetadata('pages.landing');

    expect(getTranslations).toHaveBeenCalledWith({
      locale: routing.defaultLocale,
      namespace: 'pages.landing',
    });
  });

  it('sets canonical to /{locale}{path}', async () => {
    mockHeaders('fr', '/fr/login');

    const metadata = await createPageMetadata('pages.login');

    expect(metadata.alternates?.canonical).toBe('/fr/login');
  });

  it('sets canonical to /{locale} when pathname is exactly the locale prefix', async () => {
    mockHeaders('en', '/en');

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.alternates?.canonical).toBe('/en');
  });

  it('sets canonical to /{locale} when pathname is missing', async () => {
    mockHeaders('en', null);

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.alternates?.canonical).toBe('/en');
  });

  it('sets canonical to /{locale} when pathname is missing with non-default locale', async () => {
    mockHeaders('fr', null);

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.alternates?.canonical).toBe('/fr');
  });

  it('prepends locale to path when pathname has no locale prefix', async () => {
    mockHeaders('fr', '/about');

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.alternates?.canonical).toBe('/fr/about');
  });

  it('includes all supported locales with path in alternates.languages', async () => {
    mockHeaders('en', '/en/login');

    const metadata = await createPageMetadata('pages.login');
    const languages = metadata.alternates?.languages as Record<string, string>;

    for (const locale of supportedLocales) {
      expect(languages[locale.code]).toBe(`/${locale.code}/login`);
    }
  });

  it('includes x-default with default locale and path', async () => {
    mockHeaders('fr', '/fr/login');

    const metadata = await createPageMetadata('pages.login');
    const languages = metadata.alternates?.languages as Record<string, string>;

    expect(languages['x-default']).toBe(`/${routing.defaultLocale}/login`);
  });

  it.each([
    ['en', 'en_US'],
    ['fr', 'fr_FR'],
    ['de', 'en_US'],
  ])('maps %s locale to %s openGraph locale', async (locale, expected) => {
    mockHeaders(locale, null);

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.openGraph?.locale).toBe(expected);
  });

  it('builds openGraph url from env, locale and path', async () => {
    mockHeaders('fr', '/fr/login');

    const metadata = await createPageMetadata('pages.login');

    expect(metadata.openGraph?.url).toBe(`${env.NEXT_PUBLIC_APP_URL}/fr/login`);
  });

  it('sets openGraph title and description to translated values', async () => {
    mockHeaders('en', null);

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.openGraph?.title).toBe(translationMock('title'));
    expect(metadata.openGraph?.description).toBe(
      translationMock('description'),
    );
  });

  it('sets openGraph type to website', async () => {
    mockHeaders('en', null);

    const metadata = await createPageMetadata('pages.landing');
    const openGraph = metadata.openGraph as OgWebsite;

    expect(openGraph.type).toBe('website');
  });

  it('sets twitter card, title and description to translated values', async () => {
    mockHeaders('en', null);

    const metadata = await createPageMetadata('pages.landing');
    const twitter = metadata.twitter as TwitterCard;

    expect(twitter.card).toBe('summary_large_image');
    expect(twitter.title).toBe(translationMock('title'));
    expect(twitter.description).toBe(translationMock('description'));
  });
});
