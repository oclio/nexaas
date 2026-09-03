'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { NavLink } from '@/app/[locale]/(main)/_components/nav-link';
import { useLandingNav } from '@/app/[locale]/(main)/_components/use-landing-nav';
import LocaleSwitcher from '@/core/i18n/components/locale-switcher';
import { navigation } from '@/navigation';
import Logo from '@/ui/components/logo';
import { buttonVariants } from '@/ui/components/shadcn/button';
import ThemeToggle from '@/ui/components/theme-toggle';
import { cn } from '@/ui/helpers';

import MobileMenu from './mobile-menu';

const links = navigation.filter((item) => item.location.includes('navbar'));

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname, isLandingPage, activeSection } = useLandingNav(links);
  const t = useTranslations();

  useEffect(() => {
    if (!isLandingPage) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage]);

  return (
    <nav
      className={cn(
        'fixed top-0 z-20 w-full border-b transition-all duration-300',
        isScrolled
          ? 'bg-background/80 border-border/50 backdrop-blur-lg'
          : 'border-transparent bg-transparent',
      )}
      data-testid="navbar"
      data-scrolled={isScrolled}
    >
      <div className="mx-auto max-w-6xl px-4 xl:px-0">
        <div className="flex items-center justify-between gap-6 py-3 lg:gap-0">
          <Link
            href="/"
            aria-label={t('labels.backToHome')}
            aria-current={isLandingPage ? 'page' : undefined}
          >
            <Logo priority />
          </Link>

          <ul className="hidden gap-12 text-sm lg:flex">
            {links.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  label={t(item.label)}
                  pathname={pathname}
                  activeSection={activeSection}
                />
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/login"
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  size: 'sm',
                }),
              )}
            >
              {t('labels.login')}
            </Link>
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
          <div className="lg:hidden">
            <MobileMenu
              variant="outline"
              pathname={pathname}
              activeSection={activeSection}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
