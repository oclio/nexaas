import { act, fireEvent, render, screen } from '@testing-library/react';

import Navbar from '../navbar';

const translateKey = (key: string) => key;

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => translateKey),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
    onClick,
    'aria-label': ariaLabel,
    'aria-current': ariaCurrent,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: (event_: React.MouseEvent<HTMLAnchorElement>) => void;
    'aria-label'?: string;
    'aria-current'?: 'page';
  }) => (
    <a
      href={href}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      data-testid="next-link"
    >
      {children}
    </a>
  ),
}));

const navHookMock = vi.fn<
  (links: unknown[]) => {
    pathname: string;
    isLandingPage: boolean;
    activeSection: string;
  }
>(() => ({
  pathname: '/',
  isLandingPage: true,
  activeSection: '',
}));

vi.mock('@/app/[locale]/(main)/_components/use-landing-nav', () => ({
  useLandingNav: (links: unknown[]) => navHookMock(links),
}));

vi.mock('@/config/navigation', () => ({
  navigation: [
    {
      label: 'pages.landing.features.title',
      href: '/#features-section',
      location: ['navbar', 'footer', 'mobileMenu'],
      category: 'product',
    },
    {
      label: 'pages.landing.cta.title',
      href: '/#cta-section',
      location: ['navbar', 'mobileMenu'],
      category: 'product',
    },
    {
      label: 'pages.documentation.title',
      href: '#',
      location: ['footer', 'mobileMenu'],
      category: 'help',
    },
  ],
}));

vi.mock('@/ui/components/logo', () => ({
  default: ({ priority }: { priority?: boolean }) => (
    <div data-testid="logo" data-priority={priority ? 'true' : 'false'} />
  ),
}));

vi.mock('@/ui/components/theme-toggle', () => ({
  default: () => <div data-testid="theme-toggle" />,
}));

vi.mock('@/core/i18n/components/locale-switcher', () => ({
  default: ({ align }: { align?: string }) => (
    <div data-testid="locale-switcher" data-align={align} />
  ),
}));

vi.mock('@/ui/components/shadcn/button', () => ({
  buttonVariants: ({ variant, size }: { variant?: string; size?: string }) =>
    `variant-${variant} size-${size}`,
}));

vi.mock('../../nav-link', () => ({
  NavLink: ({
    href,
    label,
    pathname,
    activeSection,
  }: {
    href: string;
    label: string;
    pathname: string;
    activeSection?: string;
  }) => (
    <a
      href={href}
      data-testid="nav-link"
      data-pathname={pathname}
      data-active-section={activeSection}
    >
      {label}
    </a>
  ),
}));

vi.mock('../mobile-menu', () => ({
  default: ({
    pathname,
    activeSection,
    variant,
  }: {
    pathname: string;
    activeSection: string;
    variant?: string;
  }) => (
    <div
      data-testid="mobile-menu"
      data-pathname={pathname}
      data-active-section={activeSection}
      data-variant={variant}
    />
  ),
}));

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navHookMock.mockReturnValue({
      pathname: '/',
      isLandingPage: true,
      activeSection: '',
    });
  });

  it('renders a nav element with the navbar test id', () => {
    render(<Navbar />);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders the logo link to home with a back-to-home aria-label', () => {
    render(<Navbar />);

    const links = screen.getAllByTestId('next-link');
    const homeLink = links.find((l) => l.getAttribute('href') === '/');
    expect(homeLink).toBeTruthy();
    expect(homeLink).toHaveAttribute('aria-label', 'labels.backToHome');
  });

  it('marks the home link as current page when on the landing page', () => {
    render(<Navbar />);

    const homeLink = screen
      .getAllByTestId('next-link')
      .find((l) => l.getAttribute('href') === '/');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark the home link as current page when not on the landing page', () => {
    navHookMock.mockReturnValue({
      pathname: '/faq',
      isLandingPage: false,
      activeSection: '',
    });

    render(<Navbar />);

    const homeLink = screen
      .getAllByTestId('next-link')
      .find((l) => l.getAttribute('href') === '/');
    expect(homeLink).not.toHaveAttribute('aria-current');
  });

  describe('logo click behavior', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('prevents default and scrolls to top when on the landing page', () => {
      const scrollToSpy = vi.spyOn(globalThis, 'scrollTo');
      render(<Navbar />);

      const homeLink = screen
        .getAllByTestId('next-link')
        .find((l) => l.getAttribute('href') === '/');
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      fireEvent(homeLink as HTMLElement, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('does not prevent default when not on the landing page', () => {
      navHookMock.mockReturnValue({
        pathname: '/faq',
        isLandingPage: false,
        activeSection: '',
      });
      const scrollToSpy = vi.spyOn(globalThis, 'scrollTo');
      render(<Navbar />);

      const homeLink = screen
        .getAllByTestId('next-link')
        .find((l) => l.getAttribute('href') === '/');
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      fireEvent(homeLink as HTMLElement, event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(scrollToSpy).not.toHaveBeenCalled();
    });
  });

  it('renders only navigation items with navbar in their location', () => {
    render(<Navbar />);

    const navLinks = screen.getAllByTestId('nav-link');
    expect(navLinks).toHaveLength(2);
    expect(navLinks[0]).toHaveAttribute('href', '/#features-section');
    expect(navLinks[1]).toHaveAttribute('href', '/#cta-section');
  });

  it('passes pathname and activeSection to each NavLink', () => {
    navHookMock.mockReturnValue({
      pathname: '/',
      isLandingPage: true,
      activeSection: 'features-section',
    });

    render(<Navbar />);

    const navLinks = screen.getAllByTestId('nav-link');
    for (const link of navLinks) {
      expect(link).toHaveAttribute('data-pathname', '/');
      expect(link).toHaveAttribute('data-active-section', 'features-section');
    }
  });

  it('renders a login link', () => {
    render(<Navbar />);

    const loginLink = screen
      .getAllByTestId('next-link')
      .find((l) => l.getAttribute('href') === '/login');
    expect(loginLink).toBeTruthy();
    expect(loginLink).toHaveTextContent('labels.login');
  });

  it('renders the theme toggle and locale switcher on desktop', () => {
    render(<Navbar />);

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
  });

  it('renders the mobile menu with pathname, activeSection, and variant', () => {
    navHookMock.mockReturnValue({
      pathname: '/faq',
      isLandingPage: false,
      activeSection: '',
    });

    render(<Navbar />);

    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toHaveAttribute('data-pathname', '/faq');
    expect(mobileMenu).toHaveAttribute('data-active-section', '');
    expect(mobileMenu).toHaveAttribute('data-variant', 'outline');
  });

  it('passes the filtered navbar links to useLandingNav', () => {
    render(<Navbar />);

    expect(navHookMock).toHaveBeenCalled();
    const linksArgument = navHookMock.mock.calls[0][0] as unknown as {
      href: string;
    }[];
    expect(linksArgument).toHaveLength(2);
    expect(linksArgument[0].href).toBe('/#features-section');
    expect(linksArgument[1].href).toBe('/#cta-section');
  });

  describe('scroll behavior', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('initializes isScrolled as false on mount', () => {
      render(<Navbar />);

      expect(screen.getByTestId('navbar')).toHaveAttribute(
        'data-scrolled',
        'false',
      );
    });

    it.each([
      { scrollY: 51, expected: 'true', label: 'exceeds 50' },
      { scrollY: 50, expected: 'false', label: 'is exactly 50' },
      { scrollY: 30, expected: 'false', label: 'is below 50' },
    ])(
      'sets isScrolled to $expected when scrollY $label on landing page',
      ({ scrollY, expected }) => {
        Object.defineProperty(globalThis, 'scrollY', {
          writable: true,
          configurable: true,
          value: scrollY,
        });

        render(<Navbar />);

        act(() => {
          dispatchEvent(new Event('scroll'));
        });

        expect(screen.getByTestId('navbar')).toHaveAttribute(
          'data-scrolled',
          expected,
        );
      },
    );

    it('removes the scroll listener with the correct event name on unmount', () => {
      const removeSpy = vi.spyOn(globalThis, 'removeEventListener');

      const { unmount } = render(<Navbar />);

      unmount();

      const scrollRemovals = removeSpy.mock.calls.filter(
        ([event]) => event === 'scroll',
      );
      expect(scrollRemovals.length).toBeGreaterThanOrEqual(1);
    });

    it('re-runs the scroll effect when isLandingPage changes', () => {
      navHookMock.mockReturnValue({
        pathname: '/',
        isLandingPage: true,
        activeSection: '',
      });

      const removeSpy = vi.spyOn(globalThis, 'removeEventListener');

      const { rerender } = render(<Navbar />);

      const initialScrollRemovals = removeSpy.mock.calls.filter(
        ([event]) => event === 'scroll',
      ).length;

      navHookMock.mockReturnValue({
        pathname: '/faq',
        isLandingPage: false,
        activeSection: '',
      });

      rerender(<Navbar />);

      const finalScrollRemovals = removeSpy.mock.calls.filter(
        ([event]) => event === 'scroll',
      ).length;
      expect(finalScrollRemovals).toBeGreaterThan(initialScrollRemovals);
    });

    it('does not attach a scroll listener when not on the landing page', () => {
      navHookMock.mockReturnValue({
        pathname: '/faq',
        isLandingPage: false,
        activeSection: '',
      });

      const addSpy = vi.spyOn(globalThis, 'addEventListener');

      render(<Navbar />);

      const scrollListeners = addSpy.mock.calls.filter(
        ([event]) => event === 'scroll',
      );
      expect(scrollListeners).toHaveLength(0);
    });
  });
});
