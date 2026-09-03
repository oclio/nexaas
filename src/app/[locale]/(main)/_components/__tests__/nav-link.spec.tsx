import { fireEvent, render, screen } from '@testing-library/react';

import { NavLink } from '../nav-link';

vi.mock('@/core/i18n/navigation', () => ({
  Link: ({
    href,
    onClick,
    className,
    children,
    'aria-current': ariaCurrent,
  }: {
    href: string;
    onClick?: (event_: React.MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
    children: React.ReactNode;
    'aria-current'?: 'page';
  }) => (
    <a
      href={href}
      onClick={onClick}
      className={className}
      aria-current={ariaCurrent}
      data-testid="nav-link"
    >
      {children}
    </a>
  ),
}));

vi.mock('@/ui/helpers', () => ({
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(' '),
  handleHashScroll: vi.fn(),
}));

import { handleHashScroll } from '@/ui/helpers';

describe('NavLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the label text', () => {
      render(<NavLink href="/about" label="About" pathname="/" />);

      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('passes the href to the link', () => {
      render(<NavLink href="/about" label="About" pathname="/" />);

      expect(screen.getByTestId('nav-link')).toHaveAttribute('href', '/about');
    });
  });

  describe('active state for hash links', () => {
    it('marks the link as active when on landing page and section matches', () => {
      render(
        <NavLink
          href="/#features"
          label="Features"
          pathname="/"
          activeSection="features"
        />,
      );

      const link = screen.getByTestId('nav-link');
      expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('does not mark the link as active when not on landing page', () => {
      render(
        <NavLink
          href="/#features"
          label="Features"
          pathname="/about"
          activeSection="features"
        />,
      );

      expect(screen.getByTestId('nav-link')).not.toHaveAttribute(
        'aria-current',
      );
    });

    it('does not mark the link as active when the section does not match', () => {
      render(
        <NavLink
          href="/#features"
          label="Features"
          pathname="/"
          activeSection="faq"
        />,
      );

      expect(screen.getByTestId('nav-link')).not.toHaveAttribute(
        'aria-current',
      );
    });
  });

  describe('active state for regular links', () => {
    it('marks the home link as active on landing page with no active section', () => {
      render(<NavLink href="/" label="Home" pathname="/" activeSection="" />);

      expect(screen.getByTestId('nav-link')).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('marks the home link as active on landing page when activeSection is omitted', () => {
      render(<NavLink href="/" label="Home" pathname="/" />);

      expect(screen.getByTestId('nav-link')).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('does not mark the home link as active when not on landing page', () => {
      render(
        <NavLink href="/" label="Home" pathname="/about" activeSection="" />,
      );

      expect(screen.getByTestId('nav-link')).not.toHaveAttribute(
        'aria-current',
      );
    });

    it('does not mark the home link as active when a section is active', () => {
      render(
        <NavLink href="/" label="Home" pathname="/" activeSection="features" />,
      );

      expect(screen.getByTestId('nav-link')).not.toHaveAttribute(
        'aria-current',
      );
    });

    it('does not mark a non-home link as active', () => {
      render(
        <NavLink href="/about" label="About" pathname="/" activeSection="" />,
      );

      expect(screen.getByTestId('nav-link')).not.toHaveAttribute(
        'aria-current',
      );
    });
  });

  describe('active state for page-current (non-hash) links', () => {
    it('marks a non-hash link as active when pathname matches href', () => {
      render(<NavLink href="/contact" label="Contact" pathname="/contact" />);

      expect(screen.getByTestId('nav-link')).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    it('does not mark a non-hash link as active when pathname differs', () => {
      render(<NavLink href="/contact" label="Contact" pathname="/about" />);

      expect(screen.getByTestId('nav-link')).not.toHaveAttribute(
        'aria-current',
      );
    });

    it('does not mark a non-hash link as active on the landing page', () => {
      render(
        <NavLink
          href="/contact"
          label="Contact"
          pathname="/"
          activeSection=""
        />,
      );

      expect(screen.getByTestId('nav-link')).not.toHaveAttribute(
        'aria-current',
      );
    });
  });

  describe('click behavior', () => {
    it('calls handleHashScroll with the event, href, and pathname on click', () => {
      render(<NavLink href="/#features" label="Features" pathname="/" />);

      fireEvent.click(screen.getByTestId('nav-link'));

      expect(handleHashScroll).toHaveBeenCalledWith(
        expect.any(Object),
        '/#features',
        '/',
      );
    });
  });

  describe('className', () => {
    it('merges a custom className', () => {
      render(
        <NavLink
          href="/about"
          label="About"
          pathname="/"
          className="custom-class"
        />,
      );

      expect(screen.getByTestId('nav-link').className).toContain(
        'custom-class',
      );
    });
  });
});
