import { render, screen } from '@testing-library/react';

import LandingPage from '../page';

describe('LandingPage', () => {
  it('renders a heading', () => {
    render(<LandingPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'LandingPage' }),
    ).toBeInTheDocument();
  });
});
