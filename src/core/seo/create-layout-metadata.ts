import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { app } from '@/config';
import { env } from '@/core/env';
import { routing, supportedLocales } from '@/core/i18n/routing';

const ogLocaleMap: Record<string, string> = {
  en: 'en_US',
  fr: 'fr_FR',
};

/**
 * Builds the root-level metadata applied to every page.
 *
 * Translated fields (description, keywords, OG/Twitter text) are
 * resolved from the `meta` i18n namespace. The title comes from `app.title`
 * (brand name, not translated). Technical fields that don't need translation
 * (metadataBase, robots, viewport, etc.) are static.
 *
 * Pages override the subset they need via `createPageMetadata`.
 */
export async function createLayoutMetadata({
  locale,
}: {
  locale: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const languages = Object.fromEntries(
    supportedLocales.map((l) => [l.code, `/${l.code}`]),
  );

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
    title: {
      default: app.title,
      template: `%s | ${app.title}`,
    },
    description: t('description'),
    applicationName: app.title,
    authors: [{ name: app.author.name, url: app.author.url }],
    creator: app.author.name,
    publisher: app.title,
    keywords: [
      ...new Set([...app.keywords, ...(t.raw('keywords') as string[])]),
    ],
    icons: {
      icon: app.logo,
    },
    openGraph: {
      type: 'website',
      locale: ogLocaleMap[locale] ?? ogLocaleMap[routing.defaultLocale],
      url: `${env.NEXT_PUBLIC_APP_URL}/${locale}`,
      siteName: app.title,
      title: app.title,
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: app.title,
      description: t('description'),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...languages,
        'x-default': `/${routing.defaultLocale}`,
      },
    },
  };
}
