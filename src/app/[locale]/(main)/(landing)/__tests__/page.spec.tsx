import { render, screen } from '@testing-library/react';

import LandingPage, { generateMetadata } from '../page';

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMetadata', () => {
    it('returns the translated page title without suffix', async () => {
      const metadata = await generateMetadata();

      expect(metadata.title).toBe('Welcome!');
    });

    it('passes the locale and namespace to getTranslations', async () => {
      const { getTranslations } = await import('next-intl/server');

      await generateMetadata();

      expect(getTranslations).toHaveBeenCalledWith({
        locale: 'en',
        namespace: 'pages.landing',
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
      const { getTranslations } = await import('next-intl/server');

      render(await LandingPage());

      expect(getTranslations).toHaveBeenCalledWith('pages.landing');
    });
  });
});
