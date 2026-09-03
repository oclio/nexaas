import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

import FaqSection from '../faq-section';

describe('FaqSection', () => {
  it('renders an h2 heading with translated title', () => {
    render(<FaqSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).not.toBeEmptyDOMElement();
  });

  it('renders a view all link with translated text', () => {
    render(<FaqSection />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).not.toBeEmptyDOMElement();
  });

  it('uses the pages.faq translation namespace', () => {
    render(<FaqSection />);

    expect(useTranslations).toHaveBeenCalledWith('pages.faq');
  });
});
