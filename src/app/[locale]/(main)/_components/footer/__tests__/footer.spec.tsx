import { render, screen } from '@testing-library/react';

import Footer from '../footer';

describe('Footer', () => {
  it('renders a footer element', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
