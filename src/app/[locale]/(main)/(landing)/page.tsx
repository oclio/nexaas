import { getTranslations } from 'next-intl/server';

import { app } from '@/config';
import LocaleSwitcher from '@/core/i18n/components/locale-switcher';
import ThemeToggle from '@/ui/components/theme-toggle';

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages.landing' });

  return {
    title: `${t('title')} | ${app.title}`,
  };
}

export default async function LandingPage() {
  const t = await getTranslations('pages.landing');

  return (
    <div className="flex flex-col gap-6 p-4">
      <header className="flex items-center justify-between gap-4">
        <h1>{t('title')}</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher />
        </div>
      </header>
    </div>
  );
}
