import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

import StatsSection from '../stats-section';

describe('StatsSection', () => {
  it('renders an h2 heading with translated title', () => {
    render(<StatsSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).not.toBeEmptyDOMElement();
  });

  it('uses the pages.landing.stats translation namespace', () => {
    render(<StatsSection />);

    expect(useTranslations).toHaveBeenCalledWith('pages.landing.stats');
  });
});
