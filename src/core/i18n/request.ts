import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { hasLocale, type Locale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from '@/core/i18n/routing';

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const parameterValue = await rootParams.locale();
    if (hasLocale(routing.locales, parameterValue)) {
      locale = parameterValue as Locale;
    } else {
      notFound();
    }
  }

  const messagesModule = (await import(
    `../../../messages/${locale}/index.ts`
  )) as {
    default: Record<string, unknown>;
  };

  return {
    locale,
    messages: messagesModule.default,
  };
});
