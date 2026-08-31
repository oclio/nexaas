import { getTranslations } from 'next-intl/server';

import LocaleSwitcher from '@/core/i18n/components/locale-switcher';
import { createPageMetadata } from '@/core/seo';
import ThemeToggle from '@/ui/components/theme-toggle';

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  return createPageMetadata({ locale, namespace: 'pages.landing' });
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
