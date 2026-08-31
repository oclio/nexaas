import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { env } from '@/core/env';
import { routing, supportedLocales } from '@/core/i18n/routing';

import { createPageMetadata } from '../create-page-metadata';

type OgWebsite = Extract<
  NonNullable<Metadata['openGraph']>,
  { type: 'website' }
>;
type TwitterCard = Extract<
  NonNullable<Metadata['twitter']>,
  { card: 'summary_large_image' }
>;

const mockHeaders = (locale: string | null, path: string | null) => {
  const headersList = new Headers();
  if (locale) headersList.set('x-locale', locale);
  if (path) headersList.set('x-path', path);

  vi.mocked(headers).mockResolvedValue(headersList);
};

describe('createPageMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the translated title without suffix', async () => {
    mockHeaders('en', null);

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.title).toBe('Welcome!');
  });

  it('returns the translated description', async () => {
    mockHeaders('en', null);

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.description).toBe(
      'A scalable, production-ready SaaS boilerplate for Next.js.',
    );
  });

  it('passes locale and namespace to getTranslations', async () => {
    mockHeaders('fr', null);
    const { getTranslations } = await import('next-intl/server');

    await createPageMetadata('pages.landing');

    expect(getTranslations).toHaveBeenCalledWith({
      locale: 'fr',
      namespace: 'pages.landing',
    });
  });

  it('defaults locale to routing.defaultLocale when header is missing', async () => {
    mockHeaders(null, null);
    const { getTranslations } = await import('next-intl/server');

    await createPageMetadata('pages.landing');

    expect(getTranslations).toHaveBeenCalledWith({
      locale: routing.defaultLocale,
      namespace: 'pages.landing',
    });
  });

  it('sets canonical to /{locale}{path}', async () => {
    mockHeaders('fr', '/login');

    const metadata = await createPageMetadata('pages.login');

    expect(metadata.alternates?.canonical).toBe('/fr/login');
  });

  it('sets canonical to /{locale} when path is empty', async () => {
    mockHeaders('en', null);

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.alternates?.canonical).toBe('/en');
  });

  it('includes all supported locales with path in alternates.languages', async () => {
    mockHeaders('en', '/login');

    const metadata = await createPageMetadata('pages.login');
    const languages = metadata.alternates?.languages as Record<string, string>;

    for (const locale of supportedLocales) {
      expect(languages[locale.code]).toBe(`/${locale.code}/login`);
    }
  });

  it('includes x-default with default locale and path', async () => {
    mockHeaders('fr', '/login');

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
    mockHeaders('fr', '/login');

    const metadata = await createPageMetadata('pages.login');

    expect(metadata.openGraph?.url).toBe(`${env.NEXT_PUBLIC_APP_URL}/fr/login`);
  });

  it('sets openGraph title and description to translated values', async () => {
    mockHeaders('en', null);

    const metadata = await createPageMetadata('pages.landing');

    expect(metadata.openGraph?.title).toBe('Welcome!');
    expect(metadata.openGraph?.description).toBe(
      'A scalable, production-ready SaaS boilerplate for Next.js.',
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
    expect(twitter.title).toBe('Welcome!');
    expect(twitter.description).toBe(
      'A scalable, production-ready SaaS boilerplate for Next.js.',
    );
  });
});
