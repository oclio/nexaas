import { createPageMetadata } from '@/core/seo';

// import CtaSection from './_components/cta-section';
// import FaqSection from './_components/faq-section';
// import FeaturesSection from './_components/features-section';
import { HashScroll } from './_components/hash-scroll';
import HeroSection from './_components/hero-section';
// import PricingSection from './_components/pricing-section';
// import StatsSection from './_components/stats-section';
// import WhatIsIncluded from './_components/what-is-included-section';

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  return createPageMetadata({ locale, namespace: 'pages.landing', path: '' });
}

export default async function LandingPage() {
  return (
    <div className="flex min-h-svh w-full flex-col">
      <HashScroll />
      <HeroSection />
      {/* <StatsSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <WhatIsIncluded />
      <CtaSection /> */}
    </div>
  );
}
