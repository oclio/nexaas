import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { app } from '@/config';
import { env } from '@/core/env';
import { routing, supportedLocales } from '@/core/i18n/routing';

const ogLocaleMap: Record<string, string> = {
  en: 'en_US',
  fr: 'fr_FR',
};

interface Props {
  locale: string;
  namespace: string;
  path: string;
}

/**
 * Builds page-level metadata that overrides the layout defaults.
 *
 * Only the fields specific to a page are returned — the rest is inherited
 * from `createLayoutMetadata` via Next.js metadata merging.
 *
 * The `title` is returned without a suffix; the layout's
 * `title.template` (`%s | saaskip`) applies automatically.
 *
 * The `locale` and `path` are passed explicitly by each page from its
 * `params`, avoiding `headers()` and enabling static prerendering.
 */
export async function createPageMetadata({
  locale,
  namespace,
  path,
}: Readonly<Props>): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });

  const languages = Object.fromEntries(
    supportedLocales.map((l) => [l.code, `/${l.code}${path}`]),
  );

  let pageKeywords: string[] = [];
  try {
    const rawKeywords = t.raw('keywords');
    if (Array.isArray(rawKeywords)) pageKeywords = rawKeywords;
  } catch {
    // keywords is optional — pages without it inherit layout keywords
  }

  const metaT = await getTranslations({ locale, namespace: 'meta' });
  const layoutKeywords = metaT.raw('keywords') as string[];
  const keywords = [
    ...new Set([...app.keywords, ...layoutKeywords, ...pageKeywords]),
  ];

  const description = t('description', { app: app.title });

  return {
    title: t('title'),
    description,
    keywords,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        ...languages,
        'x-default': `/${routing.defaultLocale}${path}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: ogLocaleMap[locale] ?? ogLocaleMap[routing.defaultLocale],
      url: `${env.NEXT_PUBLIC_APP_URL}/${locale}${path}`,
      title: t('title'),
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description,
    },
  };
}
