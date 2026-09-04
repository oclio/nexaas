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

vi.mock('@/config/icons', () => ({
  icon: (
    name: string,
    props?: { className?: string; 'aria-hidden'?: boolean },
  ) => (
    <span
      data-testid="social-icon"
      data-icon={name}
      data-class={props?.className}
      aria-hidden={props?.['aria-hidden']}
    />
  ),
}));

vi.mock('@/config/brand', () => ({
  brand: { title: 'Saaskip' },
}));

vi.mock('@/config/navigation', () => ({
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

  it.each([
    { index: 0, href: 'https://x.com/saaskip' },
    { index: 1, href: 'https://linkedin.com/saaskip' },
  ])('passes the href to link #$index', ({ index, href }) => {
    render(<SocialLinks />);

    const links = screen.getAllByTestId('social-link');
    expect(links[index]).toHaveAttribute('href', href);
  });

  it.each([
    { index: 0, href: 'https://x.com/saaskip' },
    { index: 1, href: 'https://linkedin.com/saaskip' },
  ])(
    'sets target=_blank and rel=noopener noreferrer on link #$index',
    ({ index }) => {
      render(<SocialLinks />);

      const link = screen.getAllByTestId('social-link')[index];
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    },
  );

  it.each([
    {
      index: 0,
      expected: 'appOn:{"brand":"Saaskip","platform":"X/Twitter"}',
    },
    {
      index: 1,
      expected: 'appOn:{"brand":"Saaskip","platform":"Linkedin"}',
    },
  ])(
    'renders the aria-label with app title and platform on link #$index',
    ({ index, expected }) => {
      render(<SocialLinks />);

      const link = screen.getAllByTestId('social-link')[index];
      expect(link).toHaveAttribute('aria-label', expected);
    },
  );

  it('renders an icon for each social link', () => {
    render(<SocialLinks />);

    const icons = screen.getAllByTestId('social-icon');
    expect(icons).toHaveLength(2);
    expect(icons[0]).toHaveAttribute('aria-hidden', 'true');
    expect(icons[0].dataset.class).not.toBe('');
  });
});
