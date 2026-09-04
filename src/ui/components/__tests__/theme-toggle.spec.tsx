import { fireEvent, render, screen } from '@testing-library/react';
import * as nextIntl from 'next-intl';

import { setThemeMock, themeRef } from '@/tests/unit/mocks/ui';
import ThemeToggle from '@/ui/components/theme-toggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(nextIntl, 'useTranslations');
    themeRef.current = 'light';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders a button with the toggle aria-label', () => {
      render(<ThemeToggle />);

      expect(
        screen.getByRole('button', { name: 'toggleDark' }),
      ).toBeInTheDocument();
      expect(nextIntl.useTranslations).toHaveBeenCalledWith(
        'components.themeToggle',
      );
    });

    it('renders both dark and light icons with aria-hidden', () => {
      const { container } = render(<ThemeToggle />);

      const svgs = container.querySelectorAll('svg');
      expect(svgs).toHaveLength(2);
      expect(svgs[0].getAttribute('aria-hidden')).toBe('true');
      expect(svgs[1].getAttribute('aria-hidden')).toBe('true');
    });

    it('merges custom className with the default classes', () => {
      render(<ThemeToggle className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
      expect(button.className).toContain('group');
    });
  });

  describe('click behavior', () => {
    it('calls setTheme to toggle from light to dark when clicked', () => {
      render(<ThemeToggle />);

      fireEvent.click(screen.getByRole('button'));

      expect(setThemeMock).toHaveBeenCalled();
      const updater = setThemeMock.mock.calls[0][0];
      expect(updater('light')).toBe('dark');
    });

    it('calls setTheme to toggle from dark to light when clicked', () => {
      render(<ThemeToggle />);

      fireEvent.click(screen.getByRole('button'));

      const updater = setThemeMock.mock.calls[0][0];
      expect(updater('dark')).toBe('light');
    });
  });

  describe('icon visibility based on theme', () => {
    it('shows the dark icon when theme is dark', () => {
      themeRef.current = 'dark';
      const { container } = render(<ThemeToggle />);

      const icons = container.querySelectorAll('svg');
      expect(icons[0].getAttribute('class')).toContain('opacity-100');
      expect(icons[1].getAttribute('class')).toContain('opacity-0');
      expect(
        screen.getByRole('button', { name: 'toggleLight' }),
      ).toBeInTheDocument();
    });

    it('shows the light icon when theme is light', () => {
      const { container } = render(<ThemeToggle />);

      const icons = container.querySelectorAll('svg');
      expect(icons[0].getAttribute('class')).toContain('opacity-0');
      expect(icons[1].getAttribute('class')).toContain('opacity-100');
    });
  });

  describe('unmounted state (server snapshot)', () => {
    afterEach(() => {
      vi.resetModules();
      vi.doUnmock('react');
    });

    it('hides both icons and does not toggle theme when not mounted', async () => {
      vi.doMock('react', async () => {
        const actual = await vi.importActual<typeof import('react')>('react');
        return {
          ...actual,
          useSyncExternalStore: (
            _subscribe: unknown,
            _getSnapshot: unknown,
            getServerSnapshot: unknown,
          ) => (getServerSnapshot as () => boolean)(),
        };
      });
      vi.resetModules();

      const { default: ThemeToggleMocked } =
        await import('@/ui/components/theme-toggle');

      const { container } = render(<ThemeToggleMocked />);

      const icons = container.querySelectorAll('svg');
      expect(icons[0].getAttribute('class')).toContain('opacity-0');
      expect(icons[1].getAttribute('class')).toContain('opacity-100');

      fireEvent.click(screen.getByRole('button'));

      expect(setThemeMock).not.toHaveBeenCalled();
    });
  });
});
