import { render, screen } from '@testing-library/react';
import { getTranslations } from 'next-intl/server';

import { createPageMetadata } from '@/core/seo';

import FaqPage, { generateMetadata } from '../page';

vi.mock('@/core/seo', () => ({
  createPageMetadata: vi.fn(async () => ({
    title: 'mock-title',
    description: 'mock-description',
  })),
}));

describe('FaqPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMetadata', () => {
    it('delegates to createPageMetadata with the faq namespace', async () => {
      await generateMetadata({
        params: Promise.resolve({ locale: 'en' }),
      });

      expect(createPageMetadata).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'pages.faq',
        path: '/faq',
      });
    });

    it('returns the metadata from createPageMetadata', async () => {
      const result = await generateMetadata({
        params: Promise.resolve({ locale: 'en' }),
      });

      expect(result).toEqual({
        title: 'mock-title',
        description: 'mock-description',
      });
    });
  });

  describe('rendering', () => {
    it('renders the page title in an h1 heading', async () => {
      render(await FaqPage());

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).not.toBeEmptyDOMElement();
    });

    it('uses the pages.faq translation namespace', async () => {
      await FaqPage();

      expect(getTranslations).toHaveBeenCalledWith('pages.faq');
    });
  });
});
