import { renderHook } from '@testing-library/react';

import { useLandingNav } from '../use-landing-nav';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('../use-active-section', () => ({
  useActiveSection: vi.fn(() => 'features'),
}));

import { usePathname } from 'next/navigation';

describe('useLandingNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the normalized path and landing flag for the root locale path', () => {
    vi.mocked(usePathname).mockReturnValue('/');

    const { result } = renderHook(() =>
      useLandingNav([{ href: '/#features' }, { href: '/about' }]),
    );

    expect(result.current.pathname).toBe('/');
    expect(result.current.isLandingPage).toBe(true);
  });

  it.each([
    { rawPathname: '/en', label: 'en' },
    { rawPathname: '/fr', label: 'fr' },
  ])(
    'normalizes $label locale root to / and marks it as landing page',
    ({ rawPathname }) => {
      vi.mocked(usePathname).mockReturnValue(rawPathname);

      const { result } = renderHook(() => useLandingNav([]));

      expect(result.current.pathname).toBe('/');
      expect(result.current.isLandingPage).toBe(true);
    },
  );

  it.each([
    { rawPathname: '/en/faq', expected: '/faq', label: 'en/faq' },
    {
      rawPathname: '/fr/what-is-included',
      expected: '/what-is-included',
      label: 'fr/what-is-included',
    },
  ])(
    'normalizes $label to $expected and marks it as non-landing',
    ({ rawPathname, expected }) => {
      vi.mocked(usePathname).mockReturnValue(rawPathname);

      const { result } = renderHook(() => useLandingNav([]));

      expect(result.current.pathname).toBe(expected);
      expect(result.current.isLandingPage).toBe(false);
    },
  );

  it('passes section ids extracted from hash links to useActiveSection', async () => {
    vi.mocked(usePathname).mockReturnValue('/');
    const { useActiveSection } = await import('../use-active-section');

    renderHook(() =>
      useLandingNav([
        { href: '/#features' },
        { href: '/#faq' },
        { href: '/about' },
      ]),
    );

    expect(useActiveSection).toHaveBeenCalledWith(['features', 'faq']);
  });

  it('returns the active section from useActiveSection', () => {
    vi.mocked(usePathname).mockReturnValue('/');

    const { result } = renderHook(() =>
      useLandingNav([{ href: '/#features' }]),
    );

    expect(result.current.activeSection).toBe('features');
  });

  it('recomputes the normalized path when the pathname changes', () => {
    vi.mocked(usePathname).mockReturnValue('/');

    const { result, rerender } = renderHook(() => useLandingNav([]));

    expect(result.current.pathname).toBe('/');

    vi.mocked(usePathname).mockReturnValue('/fr/faq');
    rerender();

    expect(result.current.pathname).toBe('/faq');
    expect(result.current.isLandingPage).toBe(false);
  });
});
