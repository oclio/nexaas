import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { brand } from '@/config/brand';
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
 * resolved from the `meta` i18n namespace. The title comes from `brand.title`
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
      default: brand.title,
      template: `%s | ${brand.title}`,
    },
    description: t('description'),
    applicationName: brand.title,
    authors: [{ name: brand.author.name, url: brand.author.url }],
    creator: brand.author.name,
    publisher: brand.title,
    keywords: [...new Set(t.raw('keywords') as string[])],
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: brand.title,
    },
    openGraph: {
      type: 'website',
      locale: ogLocaleMap[locale] ?? ogLocaleMap[routing.defaultLocale],
      url: `${env.NEXT_PUBLIC_APP_URL}/${locale}`,
      siteName: brand.title,
      title: brand.title,
      description: t('description'),
      images: [
        {
          url: '/images/og.png',
          width: 1200,
          height: 630,
          alt: brand.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: brand.title,
      description: t('description'),
      images: ['/images/og.png'],
      creator: brand.author.twitter,
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
    // verification: {
    //   google: 'google-site-verification-code',
    //   other: {
    //     'msvalidate.01': 'bing-verification-code',
    //   },
    // },
  };
}
