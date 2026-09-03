import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

import WhatIsIncludedSection from '../what-is-included-section';

describe('WhatIsIncludedSection', () => {
  it('renders an h2 heading with translated title', () => {
    render(<WhatIsIncludedSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).not.toBeEmptyDOMElement();
  });

  it('renders a view all link with translated text', () => {
    render(<WhatIsIncludedSection />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).not.toBeEmptyDOMElement();
  });

  it('uses the pages.whatIsIncluded translation namespace', () => {
    render(<WhatIsIncludedSection />);

    expect(useTranslations).toHaveBeenCalledWith('pages.whatIsIncluded');
  });
});
