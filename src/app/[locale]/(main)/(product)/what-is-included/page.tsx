import { getTranslations } from 'next-intl/server';

import { createPageMetadata } from '@/core/seo';

import PageLayout from '../../_components/page-layout';

export async function generateMetadata() {
  return createPageMetadata('pages.whatIsIncluded');
}

export default async function WhatIsIncludedPage() {
  const t = await getTranslations('pages.whatIsIncluded');

  return <PageLayout title={t('title')}>{/* content */}</PageLayout>;
}
