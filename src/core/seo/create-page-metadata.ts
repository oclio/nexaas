import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { env } from '@/core/env';
import { routing, supportedLocales } from '@/core/i18n/routing';

const ogLocaleMap: Record<string, string> = {
  en: 'en_US',
  fr: 'fr_FR',
};

/**
 * Builds page-level metadata that overrides the layout defaults.
 *
 * Only the fields specific to a page are returned — the rest is inherited
 * from `createLayoutMetadata` via Next.js metadata merging.
 *
 * The `title` is returned without a suffix; the layout's
 * `title.template` (`%s | nexaas`) applies automatically.
 *
 * The locale and page path are read from `x-locale` and `x-path` headers
 * set by the `withSeo` middleware, so pages only need to pass their
 * i18n namespace.
 */
export async function createPageMetadata(namespace: string): Promise<Metadata> {
  const headerList = await headers();
  const locale = headerList.get('x-locale') ?? routing.defaultLocale;
  const path = headerList.get('x-path') ?? '';

  const t = await getTranslations({ locale, namespace });

  const languages = Object.fromEntries(
    supportedLocales.map((l) => [l.code, `/${l.code}${path}`]),
  );

  return {
    title: t('title'),
    description: t('description'),
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
      description: t('description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
    },
  };
}
