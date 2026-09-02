import { getTranslations } from 'next-intl/server';

import { createPageMetadata } from '@/core/seo';

import PageLayout from '../../_components/page-layout';

export async function generateMetadata() {
  return createPageMetadata('pages.faq');
}

export default async function FaqPage() {
  const t = await getTranslations('pages.faq');

  return <PageLayout title={t('title')}>{/* content */}</PageLayout>;
}
