import { fireEvent, render, screen } from '@testing-library/react';

import Footer from '../footer';

const translateKey = (key: string) => key;

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => translateKey),
}));

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({
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

vi.mock('@/app/[locale]/(main)/_components/nav-link', () => ({
  NavLink: ({
    href,
    label,
    pathname,
    activeSection,
    className,
  }: {
    href: string;
    label: string;
    pathname: string;
    activeSection?: string;
    className?: string;
  }) => (
    <a
      href={href}
      data-testid="nav-link"
      data-pathname={pathname}
      data-active-section={activeSection}
      className={className}
    >
      {label}
    </a>
  ),
}));

vi.mock('@/config', () => ({
  app: { title: 'Saaskip' },
}));

vi.mock('@/core/i18n/components/locale-switcher', () => ({
  default: () => <div data-testid="locale-switcher" />,
}));

vi.mock('@/navigation', () => ({
  navigation: [
    {
      label: 'pages.landing.features.title',
      href: '/#features-section',
      location: ['navbar', 'footer', 'mobileMenu'],
      category: 'product',
    },
    {
      label: 'pages.contact.title',
      href: '/contact',
      location: ['footer', 'mobileMenu'],
      category: 'help',
    },
  ],
  navigationCategories: [
    { title: 'components.footer.categories.product', key: 'product' },
    { title: 'components.footer.categories.help', key: 'help' },
  ],
}));

vi.mock('@/ui/components/logo', () => ({
  default: () => <div data-testid="logo" />,
}));

vi.mock('../social-links', () => ({
  default: () => <div data-testid="social-links" />,
}));

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navHookMock.mockReturnValue({
      pathname: '/',
      isLandingPage: true,
      activeSection: '',
    });
  });

  it('renders a footer element', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the logo link to home with a back-to-home aria-label', () => {
    render(<Footer />);

    const homeLink = screen
      .getAllByTestId('next-link')
      .find((l) => l.getAttribute('href') === '/');
    expect(homeLink).toBeTruthy();
    expect(homeLink).toHaveAttribute('aria-label', 'labels.backToHome');
  });

  it('marks the logo link as current page when on the landing page', () => {
    render(<Footer />);

    const homeLink = screen
      .getAllByTestId('next-link')
      .find((l) => l.getAttribute('href') === '/');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark the logo link as current page when not on the landing page', () => {
    navHookMock.mockReturnValue({
      pathname: '/faq',
      isLandingPage: false,
      activeSection: '',
    });

    render(<Footer />);

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
      render(<Footer />);

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
      render(<Footer />);

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

  it('renders a NavLink for each footer navigation item', () => {
    render(<Footer />);

    const navLinks = screen.getAllByTestId('nav-link');
    expect(navLinks).toHaveLength(2);
  });

  it('groups navigation items by their category', () => {
    render(<Footer />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent(
      'components.footer.categories.product',
    );
    expect(headings[1]).toHaveTextContent('components.footer.categories.help');

    const productLink = screen
      .getAllByTestId('nav-link')
      .find((l) => l.getAttribute('href') === '/#features-section');
    const helpLink = screen
      .getAllByTestId('nav-link')
      .find((l) => l.getAttribute('href') === '/contact');

    expect(productLink).toBeTruthy();
    expect(helpLink).toBeTruthy();

    expect(productLink?.compareDocumentPosition(helpLink as Node)).toEqual(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('passes the pathname and activeSection to each NavLink', () => {
    navHookMock.mockReturnValue({
      pathname: '/',
      isLandingPage: true,
      activeSection: 'features-section',
    });

    render(<Footer />);

    const navLinks = screen.getAllByTestId('nav-link');
    for (const link of navLinks) {
      expect(link).toHaveAttribute('data-pathname', '/');
      expect(link).toHaveAttribute('data-active-section', 'features-section');
    }
  });

  it('renders the locale switcher', () => {
    render(<Footer />);

    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
  });

  it('renders the social links', () => {
    render(<Footer />);

    expect(screen.getByTestId('social-links')).toBeInTheDocument();
  });

  it('renders the copyright with the app title and all rights reserved text', () => {
    render(<Footer />);

    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent('Saaskip');
    expect(footer).toHaveTextContent('components.footer.allRightsReserved');
  });
});
