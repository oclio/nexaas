import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

import CtaSection from '../cta-section';

describe('CtaSection', () => {
  it('renders an h2 heading with translated title', () => {
    render(<CtaSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).not.toBeEmptyDOMElement();
  });

  it('uses the pages.landing.cta translation namespace', () => {
    render(<CtaSection />);

    expect(useTranslations).toHaveBeenCalledWith('pages.landing.cta');
  });
});
