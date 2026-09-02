import { render, screen } from '@testing-library/react';
import { getTranslations } from 'next-intl/server';

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
      await generateMetadata();

      expect(createPageMetadata).toHaveBeenCalledWith('pages.landing');
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
    it('renders the translated title in an h1', async () => {
      render(await LandingPage());

      expect(
        screen.getByRole('heading', { level: 1, name: 'Welcome!' }),
      ).toBeInTheDocument();
    });

    it('calls getTranslations with the pages.landing namespace', async () => {
      render(await LandingPage());

      expect(getTranslations).toHaveBeenCalledWith('pages.landing');
    });

    it('renders the LocaleSwitcher', async () => {
      render(await LandingPage());

      expect(screen.getByTestId('locale-switcher-trigger')).toBeInTheDocument();
    });
  });
});
