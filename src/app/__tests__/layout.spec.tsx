import { render, screen } from '@testing-library/react';

import RootLayout from '../layout';

describe('RootLayout', () => {
  it('renders children inside main landmark', () => {
    render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>,
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('sets html lang attribute to en', () => {
    render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>,
    );

    expect(document.documentElement).toHaveAttribute('lang', 'en');
  });
});
