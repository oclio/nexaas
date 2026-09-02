import { render, screen } from '@testing-library/react';
import { getTranslations } from 'next-intl/server';

import { createPageMetadata } from '@/core/seo';

import WhatIsIncludedPage, { generateMetadata } from '../page';

vi.mock('@/core/seo', () => ({
  createPageMetadata: vi.fn(async () => ({
    title: 'mock-title',
    description: 'mock-description',
  })),
}));

describe('WhatIsIncludedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMetadata', () => {
    it('delegates to createPageMetadata with the whatIsIncluded namespace', async () => {
      await generateMetadata();

      expect(createPageMetadata).toHaveBeenCalledWith('pages.whatIsIncluded');
    });

    it('returns the metadata from createPageMetadata', async () => {
      const result = await generateMetadata();

      expect(result).toEqual({
        title: 'mock-title',
        description: 'mock-description',
      });
    });
  });

  describe('rendering', () => {
    it('renders the page title in an h1 heading', async () => {
      render(await WhatIsIncludedPage());

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).not.toBeEmptyDOMElement();
    });

    it('uses the pages.whatIsIncluded translation namespace', async () => {
      await WhatIsIncludedPage();

      expect(getTranslations).toHaveBeenCalledWith('pages.whatIsIncluded');
    });
  });
});
