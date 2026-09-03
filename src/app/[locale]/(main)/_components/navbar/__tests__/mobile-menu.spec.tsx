import { render, screen } from '@testing-library/react';

import MobileMenu from '../mobile-menu';

const translateKey = (key: string) => key;

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => translateKey),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
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
    {
      label: 'pages.about.title',
      href: '/about',
      location: ['footer'],
      category: 'company',
    },
  ],
}));

vi.mock('@/ui/components/logo', () => ({
  default: () => <div data-testid="logo" />,
}));

vi.mock('@/ui/components/theme-toggle', () => ({
  default: () => <div data-testid="theme-toggle" />,
}));

vi.mock('@/core/i18n/components/locale-switcher', () => ({
  default: ({ align }: { align?: string }) => (
    <div data-testid="locale-switcher" data-align={align} />
  ),
}));

vi.mock('@/ui/components/shadcn/sheet', () => ({
  Sheet: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  }) => (
    <div
      data-testid="sheet"
      data-open={open}
      data-on-open-change={!!onOpenChange}
    >
      {children}
    </div>
  ),
  SheetTrigger: ({ render }: { render: React.ReactElement }) => (
    <div data-testid="sheet-trigger">{render}</div>
  ),
  SheetClose: ({
    render,
    nativeButton,
  }: {
    render: React.ReactElement;
    nativeButton?: boolean;
  }) => (
    <div data-testid="sheet-close" data-native-button={nativeButton}>
      {render}
    </div>
  ),
  SheetContent: ({
    children,
    side,
    showCloseButton,
  }: {
    children: React.ReactNode;
    side?: string;
    showCloseButton?: boolean;
  }) => (
    <div
      data-testid="sheet-content"
      data-side={side}
      data-show-close-button={showCloseButton}
    >
      {children}
    </div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-title">{children}</div>
  ),
}));

vi.mock('../../nav-link', () => ({
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

vi.mock('@/config/icons', () => ({
  icon: (name: string) => (
    <span data-testid="hugeicons-icon" data-icon={name} />
  ),
}));

vi.mock('@/ui/components/shadcn/button', () => ({
  Button: ({
    children,
    variant,
    className,
    'aria-label': ariaLabel,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
    'aria-label'?: string;
    [key: string]: unknown;
  }) => (
    <button
      data-testid="button"
      data-variant={variant}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('MobileMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the menu trigger button with an aria-label', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    expect(screen.getByTestId('button')).toHaveAttribute(
      'aria-label',
      'labels.menu',
    );
  });

  it('initializes the sheet with open=false', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    expect(screen.getByTestId('sheet')).toHaveAttribute('data-open', 'false');
  });

  it('applies size and cursor classes to the trigger button', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    const button = screen.getByTestId('button');
    expect(button.className).toContain('size-7');
    expect(button.className).toContain('cursor-pointer');
  });

  it('renders the menu icon inside the trigger', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    expect(screen.getByTestId('hugeicons-icon')).toBeInTheDocument();
  });

  it('renders the sheet content', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    expect(screen.getByTestId('sheet-content')).toBeInTheDocument();
  });

  it('passes side=left and showCloseButton=false to SheetContent', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    const content = screen.getByTestId('sheet-content');
    expect(content).toHaveAttribute('data-side', 'left');
    expect(content).toHaveAttribute('data-show-close-button', 'false');
  });

  it('renders the sheet title with the menu label', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    expect(screen.getByTestId('sheet-title')).toHaveTextContent('labels.menu');
  });

  it('renders the logo inside a SheetClose link to home', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    const sheetCloseElements = screen.getAllByTestId('sheet-close');
    expect(sheetCloseElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('next-link')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders the theme toggle and locale switcher in the header', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('locale-switcher')).toHaveAttribute(
      'data-align',
      'end',
    );
  });

  it('renders only navigation items with mobileMenu in their location', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    const navLinks = screen.getAllByTestId('nav-link');
    expect(navLinks).toHaveLength(3);
    expect(navLinks[0]).toHaveAttribute('href', '/#features-section');
    expect(navLinks[1]).toHaveAttribute('href', '/#cta-section');
    expect(navLinks[2]).toHaveAttribute('href', '#');
    expect(screen.queryByText('pages.about.title')).not.toBeInTheDocument();
  });

  it('passes pathname and activeSection to each NavLink', () => {
    render(<MobileMenu pathname="/" activeSection="features" />);

    const navLinks = screen.getAllByTestId('nav-link');
    for (const link of navLinks) {
      expect(link).toHaveAttribute('data-pathname', '/');
      expect(link).toHaveAttribute('data-active-section', 'features');
    }
  });

  it('passes nativeButton={false} to all SheetClose components', () => {
    render(<MobileMenu pathname="/" activeSection="" />);

    const sheetCloseElements = screen.getAllByTestId('sheet-close');
    for (const close of sheetCloseElements) {
      expect(close).toHaveAttribute('data-native-button', 'false');
    }
  });

  it('forwards extra props to the trigger button', () => {
    render(
      <MobileMenu pathname="/" activeSection="" variant="outline" disabled />,
    );

    const button = screen.getByTestId('button');
    expect(button).toHaveAttribute('data-variant', 'outline');
    expect(button).toBeDisabled();
  });
});
