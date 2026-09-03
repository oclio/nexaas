'use client';

import { useTranslations } from 'next-intl';
export default function CtaSection() {
  const t = useTranslations('pages.landing.cta');

  return (
    <section id="cta-section" className="landing min-h-100">
      <div className="page-section flex flex-col gap-4">
        <h2 className="font-heading text-3xl tracking-tight">{t('title')}</h2>
      </div>
    </section>
  );
}
