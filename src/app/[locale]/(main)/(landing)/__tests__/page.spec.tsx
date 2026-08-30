import { render, screen } from '@testing-library/react';

import LandingPage, { generateMetadata } from '../page';

const translationMock = vi.fn((key: string) => {
  const messages: Record<string, string> = {
    title: 'Welcome!',
  };
  return messages[key] ?? key;
});
const returnKey = (key: string) => key;

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => translationMock),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => returnKey,
}));

vi.mock('@/core/i18n/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateMetadata', () => {
    it('returns title combining the translated page title and app title', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: 'en' }),
      });

      expect(metadata).toEqual({ title: 'Welcome! | nexaas' });
    });

    it('passes the locale to getTranslations', async () => {
      const { getTranslations } = await import('next-intl/server');

      await generateMetadata({
        params: Promise.resolve({ locale: 'fr' }),
      });

      expect(getTranslations).toHaveBeenCalledWith({
        locale: 'fr',
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
