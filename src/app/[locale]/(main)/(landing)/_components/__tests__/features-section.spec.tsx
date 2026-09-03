import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

import FeaturesSection from '../features-section';

describe('FeaturesSection', () => {
  it('renders an h2 heading with translated title', () => {
    render(<FeaturesSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).not.toBeEmptyDOMElement();
  });

  it('uses the pages.landing.features translation namespace', () => {
    render(<FeaturesSection />);

    expect(useTranslations).toHaveBeenCalledWith('pages.landing.features');
  });
});
