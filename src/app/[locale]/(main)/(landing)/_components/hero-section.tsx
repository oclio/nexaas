import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations();

  return (
    <section
      id="hero-section"
      className="mx-auto flex min-h-100 w-full max-w-6xl flex-col gap-8 px-6 py-16 sm:py-24 lg:py-32 xl:px-0"
    >
      <h1 className="page-title">{t('pages.landing.title')}</h1>
    </section>
  );
}
