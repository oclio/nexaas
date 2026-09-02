import { render, screen } from '@testing-library/react';

import MainLayout from '../layout';

vi.mock('../_components/navbar/navbar', () => ({
  default: () => <nav data-testid="navbar" />,
}));

vi.mock('../_components/footer/footer', () => ({
  default: () => <footer data-testid="footer" />,
}));

describe('MainLayout', () => {
  it('renders the navbar', async () => {
    render(await MainLayout({ children: <div>Content</div> }));

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('renders the footer', async () => {
    render(await MainLayout({ children: <div>Content</div> }));

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders children content', async () => {
    render(await MainLayout({ children: <div>Page content</div> }));

    expect(screen.getByText('Page content')).toBeInTheDocument();
  });
});
