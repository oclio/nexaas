import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

import HeroSection from '../hero-section';

describe('HeroSection', () => {
  it('renders an h1 heading with translated title', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).not.toBeEmptyDOMElement();
  });

  it('uses the root translation namespace', () => {
    render(<HeroSection />);

    expect(useTranslations).toHaveBeenCalledWith();
  });
});
