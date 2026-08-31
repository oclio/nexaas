import { render, screen } from '@testing-library/react';

import RootLayout, { generateMetadata, generateStaticParams } from '../layout';

vi.mock('@/core/seo', () => ({
  createLayoutMetadata: vi.fn(async ({ locale }: { locale: string }) => ({
    title: `mock-title-${locale}`,
    description: 'mock-description',
  })),
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

  it('sets html lang attribute to the given locale', async () => {
    render(
      await RootLayout({
        children: <div>Content</div>,
        ...localeParameters('en'),
      }),
    );

    expect(document.documentElement).toHaveAttribute('lang', 'en');
  });

  it('sets html lang attribute to fr for French locale', async () => {
    render(
      await RootLayout({
        children: <div>Content</div>,
        ...localeParameters('fr'),
      }),
    );

    expect(document.documentElement).toHaveAttribute('lang', 'fr');
  });

  it('applies layout classes to html element', async () => {
    render(
      await RootLayout({
        children: <div>Content</div>,
        ...localeParameters('en'),
      }),
    );

    const html = document.documentElement;
    expect(html).toHaveClass('h-full');
    expect(html).toHaveClass('antialiased');
    expect(html).toHaveClass('font-sans');
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

describe('generateMetadata', () => {
  it('delegates to createLayoutMetadata with the locale', async () => {
    const createLayoutMetadata = await import('@/core/seo');

    await generateMetadata({
      params: Promise.resolve({ locale: 'fr' }),
    });

    expect(createLayoutMetadata.createLayoutMetadata).toHaveBeenCalledWith({
      locale: 'fr',
    });
  });
});
