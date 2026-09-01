import type { Viewport } from 'next';

/**
 * Builds the viewport configuration applied to every page.
 *
 * Exported separately from metadata because Next.js requires
 * `viewport` and `themeColor` to be returned from a `viewport`
 * export, not from `generateMetadata`.
 */
export function createViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ffffff' },
      { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
  };
}
