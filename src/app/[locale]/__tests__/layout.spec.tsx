import { render, screen } from '@testing-library/react';

import RootLayout, { generateStaticParams } from '../layout';

const messagesMock = { pages: { landing: { title: 'Welcome!' } } };

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(async () => messagesMock),
}));

vi.mock('next-intl', () => ({
  hasLocale: (locales: readonly string[], locale: string) =>
    locales.includes(locale),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('next/web-vitals', () => ({
  useReportWebVitals: vi.fn(),
}));

const localeParameters = (locale: string) => ({
  params: Promise.resolve({ locale }),
});

describe('RootLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children inside main landmark', async () => {
    render(
      await RootLayout({
        children: <div>Test content</div>,
        ...localeParameters('en'),
      }),
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('sets html lang attribute to en', async () => {
    render(
      await RootLayout({
        children: <div>Content</div>,
        ...localeParameters('en'),
      }),
    );

    expect(document.documentElement).toHaveAttribute('lang', 'en');
  });

  it('fetches messages for the given locale', async () => {
    const { getMessages } = await import('next-intl/server');

    render(
      await RootLayout({
        children: <div>Content</div>,
        ...localeParameters('fr'),
      }),
    );

    expect(getMessages).toHaveBeenCalledWith({ locale: 'fr' });
  });

  it('throws notFound for an invalid locale', async () => {
    await expect(
      RootLayout({
        children: <div>Content</div>,
        ...localeParameters('invalid'),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});

describe('generateStaticParams', () => {
  it('returns all supported locales', () => {
    const parameters = generateStaticParams();

    expect(parameters).toEqual([{ locale: 'en' }, { locale: 'fr' }]);
  });
});
