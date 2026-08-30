import { defineRouting } from 'next-intl/routing';

export const supportedLocales = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
] as const;

export const routing = defineRouting({
  locales: supportedLocales.map((locale) => locale.code),
  defaultLocale: 'en',
  localePrefix: 'always',
});
