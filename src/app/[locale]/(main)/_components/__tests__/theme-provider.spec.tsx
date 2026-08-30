import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

const { NextThemesProviderMock } = vi.hoisted(() => {
  const NextThemesProviderMock = vi.fn(
    ({ children }: { children: ReactNode }) => (
      <div data-testid="next-themes-provider">{children}</div>
    ),
  );
  return { NextThemesProviderMock };
});

vi.mock('next-themes', () => ({
  ThemeProvider: NextThemesProviderMock,
}));

import { ThemeProvider } from '@/app/[locale]/(main)/_components/theme-provider';

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders children inside NextThemesProvider', () => {
      render(
        <ThemeProvider>
          <span>child content</span>
        </ThemeProvider>,
      );

      expect(screen.getByTestId('next-themes-provider')).toBeInTheDocument();
      expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it.each([
      { key: 'attribute', value: 'class' },
      { key: 'defaultTheme', value: 'system' },
      { key: 'enableSystem', value: true },
    ])('passes default $key to NextThemesProvider', ({ key, value }) => {
      render(
        <ThemeProvider>
          <div>content</div>
        </ThemeProvider>,
      );

      expect(NextThemesProviderMock).toHaveBeenCalledWith(
        expect.objectContaining({ [key]: value }),
        undefined,
      );
    });

    it('forwards extra props to NextThemesProvider, overriding defaults', () => {
      render(
        <ThemeProvider attribute="data-theme" disableTransitionOnChange>
          <div>content</div>
        </ThemeProvider>,
      );

      expect(NextThemesProviderMock).toHaveBeenCalledWith(
        expect.objectContaining({
          attribute: 'data-theme',
          defaultTheme: 'system',
          disableTransitionOnChange: true,
          enableSystem: true,
        }),
        undefined,
      );
    });
  });

  describe('development console.error override', () => {
    const originalConsoleError = console.error;

    afterEach(() => {
      console.error = originalConsoleError;
      vi.unstubAllEnvs();
      vi.resetModules();
    });

    it('swallows "Encountered a script tag" warnings when NODE_ENV is development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.resetModules();

      const innerSpy = vi.fn();
      vi.spyOn(console, 'error').mockImplementation(innerSpy);

      await import('@/app/[locale]/(main)/_components/theme-provider');

      console.error('Encountered a script tag in the document');

      expect(innerSpy).not.toHaveBeenCalled();
    });

    it('forwards non-script-tag messages to the original console.error in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.resetModules();

      const innerSpy = vi.fn();
      vi.spyOn(console, 'error').mockImplementation(innerSpy);

      await import('@/app/[locale]/(main)/_components/theme-provider');

      console.error('some other error');

      expect(innerSpy).toHaveBeenCalledWith('some other error');
    });

    it('does not override console.error when NODE_ENV is not development', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.resetModules();

      const innerSpy = vi.fn();
      const spy = vi.spyOn(console, 'error').mockImplementation(innerSpy);

      await import('@/app/[locale]/(main)/_components/theme-provider');

      console.error('Encountered a script tag in the document');

      // No override in production — the spy (current console.error) is called directly
      expect(spy).toHaveBeenCalledWith(
        'Encountered a script tag in the document',
      );
    });
  });
});
