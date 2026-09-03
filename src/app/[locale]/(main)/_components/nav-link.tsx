'use client';

import { Link } from '@/core/i18n/navigation';
import { cn, handleHashScroll } from '@/ui/helpers';

interface Props {
  href: string;
  label: string;
  pathname: string;
  /**
   * Currently active section id on the landing page.
   * When provided and the href is a hash link, the link is highlighted
   * if it matches the active section.
   */
  activeSection?: string;
  className?: string;
}

/**
 * Renders an internal link that supports both regular navigation and
 * smooth scrolling to a landing page section.
 *
 * - If `href` contains a hash and the current page is the landing page,
 *   clicking the link smoothly scrolls to the target section.
 * - If `activeSection` is provided and matches the hash, the link is styled
 *   as active.
 */
export function NavLink({
  href,
  label,
  pathname,
  activeSection = '',
  className,
}: Readonly<Props>) {
  const sectionId = href.split('#', 2)[1] ?? '';
  const isHashLink = Boolean(sectionId);
  const isLandingPage = pathname === '/';
  const isActive = isHashLink
    ? isLandingPage && activeSection === sectionId
    : isLandingPage && href === '/' && activeSection === '';

  return (
    <Link
      href={href}
      onClick={(event_) => handleHashScroll(event_, href, pathname)}
      className={cn(
        {
          'text-muted-foreground hover:text-foreground': !isActive,
          'text-primary pointer-events-none cursor-default font-medium':
            isActive,
        },
        className,
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}
