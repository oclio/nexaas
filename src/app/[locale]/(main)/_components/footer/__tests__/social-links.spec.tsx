import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

import SocialLinks from '../social-links';

const translateKey = (key: string, values: Record<string, string>) =>
  `${key}:${JSON.stringify(values)}`;

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => translateKey),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    'aria-label': ariaLabel,
    target,
    rel,
  }: {
    href: string;
    children: React.ReactNode;
    'aria-label'?: string;
    target?: string;
    rel?: string;
  }) => (
    <a
      href={href}
      aria-label={ariaLabel}
      target={target}
      rel={rel}
      data-testid="social-link"
    >
      {children}
    </a>
  ),
}));

vi.mock('@hugeicons/react', () => ({
  HugeiconsIcon: ({
    icon,
    className,
    'aria-hidden': ariaHidden,
  }: {
    icon: unknown;
    className?: string;
    'aria-hidden'?: boolean;
  }) => (
    <span
      data-testid="social-icon"
      data-icon={String(icon)}
      data-class={className}
      aria-hidden={ariaHidden}
    />
  ),
}));

vi.mock('@/config/brand', () => ({
  brand: { title: 'Saaskip' },
}));

vi.mock('@/navigation', () => ({
  socialLinks: [
    { name: 'X/Twitter', icon: 'icon-twitter', href: 'https://x.com/saaskip' },
    {
      name: 'Linkedin',
      icon: 'icon-linkedin',
      href: 'https://linkedin.com/saaskip',
    },
  ],
}));

describe('SocialLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a link for each social link', () => {
    render(<SocialLinks />);

    expect(screen.getAllByTestId('social-link')).toHaveLength(2);
  });

  it('uses the components.footer translation namespace', () => {
    render(<SocialLinks />);

    expect(useTranslations).toHaveBeenCalledWith('components.footer');
  });

  it('passes the href to each link', () => {
    render(<SocialLinks />);

    const links = screen.getAllByTestId('social-link');
    expect(links[0]).toHaveAttribute('href', 'https://x.com/saaskip');
    expect(links[1]).toHaveAttribute('href', 'https://linkedin.com/saaskip');
  });

  it('sets target=_blank and rel=noopener noreferrer on each link', () => {
    render(<SocialLinks />);

    for (const link of screen.getAllByTestId('social-link')) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('renders an aria-label with the app title and platform name', () => {
    render(<SocialLinks />);

    const links = screen.getAllByTestId('social-link');
    expect(links[0]).toHaveAttribute(
      'aria-label',
      'appOn:{"brand":"Saaskip","platform":"X/Twitter"}',
    );
    expect(links[1]).toHaveAttribute(
      'aria-label',
      'appOn:{"brand":"Saaskip","platform":"Linkedin"}',
    );
  });

  it('renders an icon for each social link', () => {
    render(<SocialLinks />);

    const icons = screen.getAllByTestId('social-icon');
    expect(icons).toHaveLength(2);
    expect(icons[0]).toHaveAttribute('aria-hidden', 'true');
  });
});
