import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { env } from '@/core/env';
import { routing, supportedLocales } from '@/core/i18n/routing';

const ogLocaleMap: Record<string, string> = {
  en: 'en_US',
  fr: 'fr_FR',
};

function stripLocalePrefix(pathname: string, locale: string): string {
  const prefix = `/${locale}`;
  if (pathname === prefix) return '';
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return pathname || '';
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
 * The locale is read from the `x-locale` header set by `withIntl`,
 * and the page path is derived from the `x-pathname` header set by the
 * proxy middleware (locale prefix stripped), so pages only need to pass
 * their i18n namespace.
 */
export async function createPageMetadata(namespace: string): Promise<Metadata> {
  const headerList = await headers();
  const locale = headerList.get('x-locale') ?? routing.defaultLocale;
  const pathname = headerList.get('x-pathname') ?? '';
  const path = stripLocalePrefix(pathname, locale);

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
