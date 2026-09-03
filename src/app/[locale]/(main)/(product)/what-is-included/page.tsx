import { getTranslations } from 'next-intl/server';

import { createPageMetadata } from '@/core/seo';

import PageLayout from '../../_components/page-layout';

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    namespace: 'pages.whatIsIncluded',
    path: '/what-is-included',
  });
}

export default async function WhatIsIncludedPage() {
  const t = await getTranslations('pages.whatIsIncluded');

  return <PageLayout title={t('title')}>{/* content */}</PageLayout>;
}
