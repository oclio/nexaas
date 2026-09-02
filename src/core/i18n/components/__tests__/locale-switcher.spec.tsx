import { fireEvent, render, screen } from '@testing-library/react';

import LocaleSwitcher from '@/core/i18n/components/locale-switcher';
import { supportedLocales } from '@/core/i18n/routing';
import { pathnameRef, routerPushMock } from '@/tests/unit/mocks/intl';

const { localeRef, useTranslationsMock, dropdownMenuMock } = vi.hoisted(() => ({
  localeRef: { current: 'en' as string },
  useTranslationsMock: vi.fn(),
  dropdownMenuMock: vi.fn(),
}));

function translateLocaleSwitcher(key: string): string {
  const labels: Record<string, string> = {
    ariaLabel: 'Change language',
  };
  return labels[key] ?? key;
}

vi.mock('next-intl', () => ({
  useLocale: () => localeRef.current,
  useTranslations: useTranslationsMock,
}));

vi.mock('@/ui/components/shadcn/dropdown-menu', async () => {
  const actual = await vi.importActual<
    typeof import('@/ui/components/shadcn/dropdown-menu')
  >('@/ui/components/shadcn/dropdown-menu');
  return {
    ...actual,
    DropdownMenu: (props: Record<string, unknown>) => {
      dropdownMenuMock(props);
      return actual.DropdownMenu(props);
    },
  };
});

async function openMenu() {
  const trigger = screen.getByRole('button');
  fireEvent.click(trigger);
  // Base UI renders the portal asynchronously
  await screen.findAllByRole('menuitem');
}

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTranslationsMock.mockReturnValue(translateLocaleSwitcher);
    localeRef.current = 'en';
    pathnameRef.current = '/test';
  });

  describe('rendering', () => {
    it('renders a button displaying the capitalized current locale code', () => {
      render(<LocaleSwitcher />);

      expect(screen.getByRole('button', { name: 'En' })).toBeInTheDocument();
    });

    it('calls useTranslations with the correct namespace', () => {
      render(<LocaleSwitcher />);

      expect(useTranslationsMock).toHaveBeenCalledWith(
        'components.localeSwitcher',
      );
    });

    it.each<[align: 'start' | undefined, expected: string]>([
      [undefined, 'end'],
      ['start', 'start'],
    ])('passes align=%s to dropdown content as %s', async (align, expected) => {
      render(<LocaleSwitcher align={align} />);
      await openMenu();

      const content = screen.getByRole('menu');
      expect(content).toHaveAttribute('data-align', expected);
    });

    it('renders the dropdown as non-modal', () => {
      render(<LocaleSwitcher />);

      expect(dropdownMenuMock).toHaveBeenCalledWith(
        expect.objectContaining({ modal: false }),
      );
    });

    it('capitalizes the locale code correctly', () => {
      const nonDefault = supportedLocales.find((l) => l.code !== 'en');
      if (!nonDefault) return; // skip if only default locale configured
      localeRef.current = nonDefault.code;
      render(<LocaleSwitcher />);

      const expected =
        nonDefault.code.charAt(0).toUpperCase() + nonDefault.code.slice(1);
      expect(
        screen.getByRole('button', { name: expected }),
      ).toBeInTheDocument();
    });

    it('passes custom className to the trigger button', () => {
      render(<LocaleSwitcher className="custom-class" />);

      expect(screen.getByRole('button').className).toContain('custom-class');
    });

    it('renders an empty label when the current locale is not supported', () => {
      localeRef.current = 'de';
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('');
    });
  });

  describe('locale switching', () => {
    it.each(supportedLocales.map((lang) => [lang.code] as const))(
      'calls router.push with /test and locale %s when clicking the corresponding item',
      async (locale) => {
        render(<LocaleSwitcher />);
        await openMenu();

        fireEvent.click(screen.getByTestId(`locale-switcher-item-${locale}`));

        expect(routerPushMock).toHaveBeenCalledWith('/test', { locale });
      },
    );
  });

  describe('locale items', () => {
    it('renders one item per supported locale', async () => {
      render(<LocaleSwitcher />);
      await openMenu();

      expect(screen.getAllByRole('menuitem')).toHaveLength(
        supportedLocales.length,
      );
    });

    it('marks the active locale item with aria-current', async () => {
      const nonDefault = supportedLocales.find((l) => l.code !== 'en');
      if (!nonDefault) return; // skip if only default locale configured
      localeRef.current = nonDefault.code;
      render(<LocaleSwitcher />);
      await openMenu();

      const activeItem = screen.getByTestId(
        `locale-switcher-item-${nonDefault.code}`,
      );
      const inactiveItem = screen
        .getAllByRole('menuitem')
        .find((item) => item !== activeItem);

      expect(activeItem).toHaveAttribute('aria-current', 'true');
      expect(inactiveItem).toHaveAttribute('aria-current', 'false');
    });

    it('sets aria-label on each locale item', async () => {
      render(<LocaleSwitcher />);
      await openMenu();

      for (const item of screen.getAllByRole('menuitem')) {
        expect(item).toHaveAttribute(
          'aria-label',
          translateLocaleSwitcher('ariaLabel'),
        );
      }
    });

    it('sets data-testid with locale code on each item', async () => {
      render(<LocaleSwitcher />);
      await openMenu();

      for (const lang of supportedLocales) {
        expect(
          screen.getByTestId(`locale-switcher-item-${lang.code}`),
        ).toBeInTheDocument();
      }
    });
  });
});
