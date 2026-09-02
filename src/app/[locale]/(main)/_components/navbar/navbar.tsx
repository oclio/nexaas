'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { NavLink } from '@/app/[locale]/(main)/_components/nav-link';
import { useLandingNav } from '@/app/[locale]/(main)/_components/use-landing-nav';
import { navigation } from '@/navigation';
import { cn } from '@/ui/helpers';

const links = navigation.filter((item) => item.location.includes('navbar'));

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname, activeSection } = useLandingNav(links);
  const t = useTranslations();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 flex items-center gap-4 p-4 transition-colors',
        isScrolled && 'bg-background/80 backdrop-blur',
      )}
    >
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
    </nav>
  );
}
