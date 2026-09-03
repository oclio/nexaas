import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

import PricingSection from '../pricing-section';

describe('PricingSection', () => {
  it('renders an h2 heading with translated title', () => {
    render(<PricingSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).not.toBeEmptyDOMElement();
  });

  it('uses the pages.landing.pricing translation namespace', () => {
    render(<PricingSection />);

    expect(useTranslations).toHaveBeenCalledWith('pages.landing.pricing');
  });
});
