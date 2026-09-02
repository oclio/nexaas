import { routing } from './routing';

/**
 * Parses a pathname into its locale and path segments.
 *
 * @example
 * parsePathname('/')        → \{ locale: 'en', path: '/' \}
 * parsePathname('/fr')      → \{ locale: 'fr', path: '/' \}
 * parsePathname('/fr/faq')  → \{ locale: 'fr', path: '/faq' \}
 * parsePathname('/about')   → \{ locale: 'en', path: '/about' \}
 */
export function parsePathname(pathname: string): {
  locale: string;
  path: string;
} {
  const segment = pathname.split('/').find(Boolean);
  if (segment && routing.locales.includes(segment as never)) {
    const path = pathname.slice(`/${segment}`.length) || '/';
    return { locale: segment, path };
  }
  return { locale: routing.defaultLocale, path: pathname };
}
