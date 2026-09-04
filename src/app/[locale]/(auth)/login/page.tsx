import { getTranslations } from 'next-intl/server';

import { createPageMetadata } from '@/core/seo';

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    namespace: 'pages.login',
    path: '/login',
  });
}

export default async function LoginPage() {
  const t = await getTranslations('pages.login');

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
