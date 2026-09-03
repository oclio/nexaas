'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';

export default function FaqSection() {
  const t = useTranslations('pages.faq');

  return (
    <section id="faq-section" className="landing min-h-100">
      <div className="page-section flex flex-col gap-4">
        <h2 className="font-heading text-3xl tracking-tight">{t('title')}</h2>
        <Link
          href="/faq"
          className="text-muted-foreground hover:text-foreground"
        >
          {t('viewAll')}
        </Link>
      </div>
    </section>
  );
}
