import { render, screen } from '@testing-library/react';

vi.mock('@/core/seo', () => ({
  createPageMetadata: vi.fn(async () => ({
    title: 'mock-title',
    description: 'mock-description',
  })),
}));

import { createPageMetadata } from '@/core/seo';

import LandingPage, { generateMetadata } from '../page';

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMetadata', () => {
    it('delegates to createPageMetadata with the landing namespace', async () => {
      await generateMetadata({
        params: Promise.resolve({ locale: 'en' }),
      });

      expect(createPageMetadata).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'pages.landing',
        path: '',
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
    it('renders the hero section', async () => {
      render(await LandingPage());

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });
});
