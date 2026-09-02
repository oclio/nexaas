import { render, screen } from '@testing-library/react';

import PageLayout from '../page-layout';

describe('PageLayout', () => {
  it('renders the title in an h1 heading', () => {
    render(<PageLayout title="About" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('About');
  });

  it('renders children content', () => {
    render(
      <PageLayout title="About">
        <p>Body content</p>
      </PageLayout>,
    );

    expect(screen.getByText('Body content')).toBeInTheDocument();
  });
});
