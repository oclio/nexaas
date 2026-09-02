import { getTranslations } from 'next-intl/server';

import { createPageMetadata } from '@/core/seo';

export async function generateMetadata() {
  return createPageMetadata('pages.whatIsIncluded');
}

export default async function WhatIsIncludedPage() {
  const t = await getTranslations('pages.whatIsIncluded');

  return (
    <div>
      <h1 className="page-title">{t('title')}</h1>
    </div>
  );
}
