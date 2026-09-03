'use client';

import { useEffect } from 'react';

/**
 * Scrolls to the element matching `window.location.hash` after a client-side
 * navigation. Next.js App Router does not scroll to hash anchors on navigation
 * by default, so this component restores the expected browser behavior on
 * the landing page.
 *
 * Render it once inside the landing page layout. It has no visual output.
 */
export function HashScroll() {
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (!hash) return;

    const element = document.querySelector(`#${hash}`);
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, []);

  // React components must return a ReactNode.
  // `null` is the idiomatic way to render nothing, but unicorn/no-null
  // forbids it by default. Returning `undefined` or no return at all
  // breaks the JSX type contract.
  // eslint-disable-next-line unicorn/no-null
  return null;
}
