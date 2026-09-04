import { render, screen } from '@testing-library/react';

import { icon } from '@/config/icons';
import { translationMock } from '@/tests/unit/mocks/intl';

import AuthLayout from '../layout';

describe('AuthLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders back link pointing to home', async () => {
    render(await AuthLayout({ children: <div>login form</div> }));

    const backLink = screen.getByRole('link', { name: /back/i });
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('calls icon with the back name and aria-hidden', async () => {
    render(await AuthLayout({ children: <div>content</div> }));

    expect(vi.mocked(icon)).toHaveBeenCalledWith(
      'back',
      expect.objectContaining({ 'aria-hidden': true }),
    );
  });

  it('renders the back icon with aria-hidden', async () => {
    render(await AuthLayout({ children: <div>content</div> }));

    const backLink = screen.getByRole('link', { name: /back/i });
    const icons = backLink.querySelectorAll('[data-testid="mock-icon"]');
    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders theme toggle and locale switcher in header', async () => {
    render(await AuthLayout({ children: <div>content</div> }));

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('locale-switcher-trigger')).toBeInTheDocument();
  });

  it('renders children inside main', async () => {
    render(
      await AuthLayout({ children: <div data-testid="child">content</div> }),
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders footer with legal links pointing to correct pages', async () => {
    render(await AuthLayout({ children: <div>content</div> }));

    const footer = screen.getByRole('contentinfo');
    const links = footer.querySelectorAll('a');
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', '/terms');
    expect(links[1]).toHaveAttribute('href', '/privacy');
    expect(links[2]).toHaveAttribute('href', '/cookies');
  });

  it('passes target and rel props to each legal link', async () => {
    render(await AuthLayout({ children: <div>content</div> }));

    const footer = screen.getByRole('contentinfo');
    const links = footer.querySelectorAll('a');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('calls t.rich with the byContinuing namespace', async () => {
    render(await AuthLayout({ children: <div>content</div> }));

    expect(translationMock.rich).toHaveBeenCalledWith(
      'pages.authLayout.byContinuing',
      expect.any(Object),
    );
  });

  it('renders a non-empty sr-only label in each legal link', async () => {
    render(await AuthLayout({ children: <div>content</div> }));

    const footer = screen.getByRole('contentinfo');
    const srOnlySpans = footer.querySelectorAll('.sr-only');
    expect(srOnlySpans).toHaveLength(3);
    for (const span of srOnlySpans) {
      expect(span).not.toBeEmptyDOMElement();
    }
  });
});
