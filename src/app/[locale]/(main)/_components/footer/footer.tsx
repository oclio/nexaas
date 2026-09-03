'use client';

import { useTranslations } from 'next-intl';

import { NavLink } from '@/app/[locale]/(main)/_components/nav-link';
import { useLandingNav } from '@/app/[locale]/(main)/_components/use-landing-nav';
import { brand } from '@/config/brand';
import LocaleSwitcher from '@/core/i18n/components/locale-switcher';
import { Link } from '@/core/i18n/navigation';
import {
  navigation,
  navigationCategories,
  NavigationCategory,
  NavigationItem,
} from '@/navigation';
import Logo from '@/ui/components/logo';

import SocialLinks from './social-links';

const links = navigation.filter((item) => item.location.includes('footer'));

export default function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations();
  const { pathname, activeSection } = useLandingNav(links);

  return (
    <footer className="pb-4">
      <div className="mx-auto max-w-6xl px-6 xl:px-0">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 xl:grid-cols-6 xl:gap-8">
          <div className="col-span-2 flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between md:col-span-4 xl:col-span-2 xl:flex-col xl:items-start xl:justify-start xl:pb-0">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                aria-label={t('labels.backToHome')}
                className="block size-fit"
                aria-current={pathname === '/' ? 'page' : undefined}
                onClick={(event_) => {
                  if (pathname !== '/') {
                    return;
                  }

                  event_.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Logo />
              </Link>
            </div>
            <div className="flex shrink-0 items-center">
              <SocialLinks />
            </div>
          </div>

          {navigationCategories.map((category: NavigationCategory) => (
            <div key={category.key} className="space-y-3 text-sm">
              <h3 className="text-muted-foreground mb-4 block text-xs font-medium uppercase">
                {t(category.title)}
              </h3>
              {links
                .filter(
                  (item: NavigationItem) => item.category === category.key,
                )
                .map((item: NavigationItem) => (
                  <NavLink
                    key={item.label}
                    href={item.href}
                    label={t(item.label)}
                    pathname={pathname}
                    activeSection={activeSection}
                    className="block"
                  />
                ))}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-6 border-t py-6">
          <small className="text-muted-foreground block text-center text-xs sm:text-sm">
            {`© ${year} · ${brand.title} · ${t('components.footer.allRightsReserved')}`}
          </small>
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  );
}
