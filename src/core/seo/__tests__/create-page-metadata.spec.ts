import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { brand } from '@/config/brand';
import { env } from '@/core/env';
import { routing, supportedLocales } from '@/core/i18n/routing';
import { messagesMock, translationMock } from '@/tests/unit/mocks/intl';

import { createPageMetadata } from '../create-page-metadata';

type OgWebsite = Extract<
  NonNullable<Metadata['openGraph']>,
  { type: 'website' }
>;
type TwitterCard = Extract<
  NonNullable<Metadata['twitter']>,
  { card: 'summary_large_image' }
>;

describe('createPageMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(['title', 'description'] as const)(
    'returns the translated %s without suffix',
    async (field) => {
      const metadata = await createPageMetadata({
        locale: 'en',
        namespace: 'pages.landing',
        path: '',
      });

      expect(metadata[field]).toBe(translationMock(field));
    },
  );

  it('passes locale and namespace to getTranslations', async () => {
    await createPageMetadata({
      locale: 'fr',
      namespace: 'pages.landing',
      path: '',
    });

    expect(getTranslations).toHaveBeenCalledWith({
      locale: 'fr',
      namespace: 'pages.landing',
    });
  });

  it('sets canonical to /{locale}{path}', async () => {
    const metadata = await createPageMetadata({
      locale: 'fr',
      namespace: 'pages.login',
      path: '/login',
    });

    expect(metadata.alternates?.canonical).toBe('/fr/login');
  });

  it('sets canonical to /{locale} when path is empty', async () => {
    const metadata = await createPageMetadata({
      locale: 'en',
      namespace: 'pages.landing',
      path: '',
    });

    expect(metadata.alternates?.canonical).toBe('/en');
  });

  it('sets canonical to /{locale} with non-default locale and empty path', async () => {
    const metadata = await createPageMetadata({
      locale: 'fr',
      namespace: 'pages.landing',
      path: '',
    });

    expect(metadata.alternates?.canonical).toBe('/fr');
  });

  it('includes all supported locales with path in alternates.languages', async () => {
    const metadata = await createPageMetadata({
      locale: 'en',
      namespace: 'pages.login',
      path: '/login',
    });
    const languages = metadata.alternates?.languages as Record<string, string>;

    for (const locale of supportedLocales) {
      expect(languages[locale.code]).toBe(`/${locale.code}/login`);
    }
  });

  it('includes x-default with default locale and path', async () => {
    const metadata = await createPageMetadata({
      locale: 'fr',
      namespace: 'pages.login',
      path: '/login',
    });
    const languages = metadata.alternates?.languages as Record<string, string>;

    expect(languages['x-default']).toBe(`/${routing.defaultLocale}/login`);
  });

  it.each([
    ['en', 'en_US'],
    ['fr', 'fr_FR'],
    ['de', 'en_US'],
  ])('maps %s locale to %s openGraph locale', async (locale, expected) => {
    const metadata = await createPageMetadata({
      locale,
      namespace: 'pages.landing',
      path: '',
    });

    expect(metadata.openGraph?.locale).toBe(expected);
  });

  it('builds openGraph url from env, locale and path', async () => {
    const metadata = await createPageMetadata({
      locale: 'fr',
      namespace: 'pages.login',
      path: '/login',
    });

    expect(metadata.openGraph?.url).toBe(`${env.NEXT_PUBLIC_APP_URL}/fr/login`);
  });

  it('passes app title to the description translation', async () => {
    await createPageMetadata({
      locale: 'en',
      namespace: 'pages.landing',
      path: '',
    });

    expect(translationMock).toHaveBeenCalledWith('description', {
      app: brand.title,
    });
  });

  it('sets openGraph title and description to translated values', async () => {
    const metadata = await createPageMetadata({
      locale: 'en',
      namespace: 'pages.landing',
      path: '',
    });

    expect(metadata.openGraph?.title).toBe(translationMock('title'));
    expect(metadata.openGraph?.description).toBe(
      translationMock('description'),
    );
  });

  it('sets openGraph type to website', async () => {
    const metadata = await createPageMetadata({
      locale: 'en',
      namespace: 'pages.landing',
      path: '',
    });
    const openGraph = metadata.openGraph as OgWebsite;

    expect(openGraph.type).toBe('website');
  });

  it('sets twitter card, title and description to translated values', async () => {
    const metadata = await createPageMetadata({
      locale: 'en',
      namespace: 'pages.landing',
      path: '',
    });
    const twitter = metadata.twitter as TwitterCard;

    expect(twitter.card).toBe('summary_large_image');
    expect(twitter.title).toBe(translationMock('title'));
    expect(twitter.description).toBe(translationMock('description'));
  });

  it('returns page keywords merged with layout keywords', async () => {
    const pageKeywords = ['faq', 'help'];
    vi.mocked(translationMock.raw).mockReturnValueOnce(pageKeywords);

    const metadata = await createPageMetadata({
      locale: 'en',
      namespace: 'pages.faq',
      path: '/faq',
    });

    expect(translationMock.raw).toHaveBeenCalledTimes(2);
    expect(translationMock.raw).toHaveBeenNthCalledWith(1, 'keywords');
    expect(translationMock.raw).toHaveBeenNthCalledWith(2, 'keywords');
    expect(metadata.keywords).toEqual(
      expect.arrayContaining([...pageKeywords]),
    );
  });

  it('returns layout keywords when page has no keywords', async () => {
    vi.mocked(translationMock.raw).mockReturnValueOnce('not-an-array');

    const metadata = await createPageMetadata({
      locale: 'en',
      namespace: 'pages.landing',
      path: '',
    });

    expect(translationMock.raw).toHaveBeenCalledTimes(2);
    expect(translationMock.raw).toHaveBeenNthCalledWith(1, 'keywords');
    const layoutKeywords = (messagesMock.meta as { keywords: string[] })
      .keywords;
    expect(metadata.keywords).toEqual([...new Set(layoutKeywords)]);
  });

  it('calls getTranslations with locale and meta namespace for layout keywords', async () => {
    await createPageMetadata({
      locale: 'fr',
      namespace: 'pages.landing',
      path: '',
    });

    expect(getTranslations).toHaveBeenCalledWith({
      locale: 'fr',
      namespace: 'meta',
    });
  });
});
