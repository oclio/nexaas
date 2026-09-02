'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { parsePathname } from '@/core/i18n/parse-pathname';

import { useActiveSection } from './use-active-section';

interface Link {
  href: string;
}

/**
 * Provides the normalized pathname and the active landing section for
 * navigation components. Used by the navbar and footer links that scroll to
 * landing page sections.
 */
export function useLandingNav<T extends Link>(links: T[]) {
  const rawPathname = usePathname();

  const pathname = useMemo(
    () => parsePathname(rawPathname).path,
    [rawPathname],
  );

  const isLandingPage = pathname === '/';
  const sectionIds = links
    .map((link) => link.href.split('#', 2)[1])
    .filter((id): id is string => Boolean(id));
  const activeSection = useActiveSection(sectionIds);

  return { pathname, isLandingPage, activeSection };
}
