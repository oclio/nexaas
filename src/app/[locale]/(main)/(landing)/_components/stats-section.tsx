'use client';

import { useTranslations } from 'next-intl';

export default function StatsSection() {
  const t = useTranslations('pages.landing.stats');

  return (
    <section id="stats-section" className="landing highlight min-h-100">
      <div className="page-section flex flex-col gap-4">
        <h2 className="font-heading text-3xl tracking-tight">{t('title')}</h2>
      </div>
    </section>
  );
}
