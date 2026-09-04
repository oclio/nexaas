import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { brand } from '@/config/brand';
import { env } from '@/core/env';
import { supportedLocales } from '@/core/i18n/routing';
import { translationMock } from '@/tests/unit/mocks/intl';

import { createLayoutMetadata } from '../create-layout-metadata';

type OgWebsite = Extract<
  NonNullable<Metadata['openGraph']>,
  { type: 'website' }
>;
type TwitterCard = Extract<
  NonNullable<Metadata['twitter']>,
  { card: 'summary_large_image' }
>;
type Robots = Exclude<Metadata['robots'], string | null | undefined>;

describe('createLayoutMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets metadataBase from env.NEXT_PUBLIC_APP_URL', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.metadataBase).toEqual(new URL(env.NEXT_PUBLIC_APP_URL));
  });

  it('uses brand.title as default title and template suffix', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.title).toEqual({
      default: brand.title,
      template: `%s | ${brand.title}`,
    });
  });

  it('returns translated description from meta namespace', async () => {
    await createLayoutMetadata({ locale: 'en' });

    expect(getTranslations).toHaveBeenCalledWith({
      locale: 'en',
      namespace: 'meta',
    });
  });

  it('sets description in metadata, openGraph and twitter from translation', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.description).toBe(translationMock('description'));
    expect(metadata.openGraph?.description).toBe(
      translationMock('description'),
    );
    expect(metadata.twitter?.description).toBe(translationMock('description'));
  });

  it('returns meta keywords deduplicated', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    const keywords = metadata.keywords as string[];
    expect(keywords).toEqual([
      ...new Set(translationMock.raw('keywords') as string[]),
    ]);
  });

  it.each([
    ['en', 'en_US'],
    ['fr', 'fr_FR'],
    ['de', 'en_US'],
  ])('maps %s locale to %s openGraph locale', async (locale, expected) => {
    const metadata = await createLayoutMetadata({ locale });

    expect(metadata.openGraph?.locale).toBe(expected);
  });

  it('builds openGraph url from env and locale', async () => {
    const metadata = await createLayoutMetadata({ locale: 'fr' });

    expect(metadata.openGraph?.url).toBe(`${env.NEXT_PUBLIC_APP_URL}/fr`);
  });

  it('sets openGraph type to website', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });
    const openGraph = metadata.openGraph as OgWebsite;

    expect(openGraph.type).toBe('website');
  });

  it('sets openGraph image with alt from brand.title', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });
    const openGraph = metadata.openGraph as OgWebsite;
    const images = [openGraph.images].flat() as { url: string; alt?: string }[];

    expect(images).toHaveLength(1);
    expect(images[0]).toBeDefined();
    expect(images[0]?.url).toBeTruthy();
    expect(images[0]?.alt).toBe(brand.title);
  });

  it('sets twitter card to summary_large_image', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });
    const twitter = metadata.twitter as TwitterCard;

    expect(twitter.card).toBe('summary_large_image');
  });

  it('sets twitter title to brand.title', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.twitter?.title).toBe(brand.title);
  });

  it('sets twitter image to og.png', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });
    const twitter = metadata.twitter as TwitterCard;

    expect(twitter.images).toEqual(['/images/og.png']);
  });

  it('sets twitter creator to brand.twitter handle', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });
    const twitter = metadata.twitter as TwitterCard;

    expect(twitter.creator).toBe(brand.author.twitter);
  });

  it('sets canonical to /{locale}', async () => {
    const metadata = await createLayoutMetadata({ locale: 'fr' });

    expect(metadata.alternates?.canonical).toBe('/fr');
  });

  it('includes all supported locales in alternates.languages', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    const languages = metadata.alternates?.languages as Record<string, string>;
    expect(Object.keys(languages)).toHaveLength(supportedLocales.length + 1);
  });

  it.each(supportedLocales)(
    'includes $code in alternates.languages',
    async (locale) => {
      const metadata = await createLayoutMetadata({ locale: 'en' });

      const languages = metadata.alternates?.languages as Record<
        string,
        string
      >;
      expect(languages[locale.code]).toBe(`/${locale.code}`);
    },
  );

  it('includes x-default pointing to default locale', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    const languages = metadata.alternates?.languages as Record<string, string>;
    expect(languages['x-default']).toBe('/en');
  });

  it('enables index and follow for all bots', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });
    const robots = metadata.robots as Robots;

    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
  });

  it('configures googleBot with index, follow and max directives', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });
    const robots = metadata.robots as Robots;

    expect(robots.googleBot).toEqual({
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    });
  });

  it('uses brand.author for authors and creator', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.authors).toEqual([
      { name: brand.author.name, url: brand.author.url },
    ]);
    expect(metadata.creator).toBe(brand.author.name);
  });

  it('configures appleWebApp with capable, statusBarStyle and title', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.appleWebApp).toEqual({
      capable: true,
      statusBarStyle: 'default',
      title: brand.title,
    });
  });
});
