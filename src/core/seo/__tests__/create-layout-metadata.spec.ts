import type { Metadata } from 'next';

import { app } from '@/config';
import { env } from '@/core/env';
import { supportedLocales } from '@/core/i18n/routing';

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
type Icons = NonNullable<Extract<Metadata['icons'], { icon?: unknown }>>;

describe('createLayoutMetadata', () => {
  it('sets metadataBase from env.NEXT_PUBLIC_APP_URL', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.metadataBase).toEqual(new URL(env.NEXT_PUBLIC_APP_URL));
  });

  it('uses app.title as default title and template suffix', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.title).toEqual({
      default: app.title,
      template: `%s | ${app.title}`,
    });
  });

  it('returns translated description from meta namespace', async () => {
    const { getTranslations } = await import('next-intl/server');

    await createLayoutMetadata({ locale: 'en' });

    expect(getTranslations).toHaveBeenCalledWith({
      locale: 'en',
      namespace: 'meta',
    });
  });

  it('sets description to the translated value', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.description).toBe(
      'A scalable, production-ready SaaS boilerplate for Next.js.',
    );
  });

  it('merges app.keywords and meta keywords without duplicates', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    const keywords = metadata.keywords as string[];
    expect(keywords).toEqual([
      ...new Set([...app.keywords, 'saas', 'boilerplate', 'nextjs']),
    ]);
  });

  it('maps en locale to en_US openGraph locale', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.openGraph?.locale).toBe('en_US');
  });

  it('maps fr locale to fr_FR openGraph locale', async () => {
    const metadata = await createLayoutMetadata({ locale: 'fr' });

    expect(metadata.openGraph?.locale).toBe('fr_FR');
  });

  it('falls back to default locale for unknown locale', async () => {
    const metadata = await createLayoutMetadata({ locale: 'de' });

    expect(metadata.openGraph?.locale).toBe('en_US');
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

  it('sets openGraph description to the translated value', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.openGraph?.description).toBe(
      'A scalable, production-ready SaaS boilerplate for Next.js.',
    );
  });

  it('sets twitter card to summary_large_image', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });
    const twitter = metadata.twitter as TwitterCard;

    expect(twitter.card).toBe('summary_large_image');
  });

  it('sets twitter title to app.title', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.twitter?.title).toBe(app.title);
  });

  it('sets twitter description to the translated value', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.twitter?.description).toBe(
      'A scalable, production-ready SaaS boilerplate for Next.js.',
    );
  });

  it('sets canonical to /{locale}', async () => {
    const metadata = await createLayoutMetadata({ locale: 'fr' });

    expect(metadata.alternates?.canonical).toBe('/fr');
  });

  it('includes all supported locales in alternates.languages', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    const languages = metadata.alternates?.languages as Record<string, string>;
    for (const locale of supportedLocales) {
      expect(languages[locale.code]).toBe(`/${locale.code}`);
    }
  });

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

  it('uses app.author for authors and creator', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });

    expect(metadata.authors).toEqual([
      { name: app.author.name, url: app.author.url },
    ]);
    expect(metadata.creator).toBe(app.author.name);
  });

  it('uses app.logo for icons', async () => {
    const metadata = await createLayoutMetadata({ locale: 'en' });
    const icons = metadata.icons as Icons;

    expect(icons.icon).toBe(app.logo);
  });
});
