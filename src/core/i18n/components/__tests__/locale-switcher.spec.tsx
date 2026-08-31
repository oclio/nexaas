import { fireEvent, render, screen } from '@testing-library/react';

import LocaleSwitcher from '@/core/i18n/components/locale-switcher';
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

useTranslationsMock.mockReturnValue(translateLocaleSwitcher);

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

    it.each([
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
      localeRef.current = 'fr';
      render(<LocaleSwitcher />);

      expect(screen.getByRole('button', { name: 'Fr' })).toBeInTheDocument();
    });

    it('passes custom className to the trigger button', () => {
      render(<LocaleSwitcher className="custom-class" />);

      expect(screen.getByRole('button').className).toContain('custom-class');
    });

    it.each([
      ['ghost', 'focus-visible:border-transparent'],
      ['outline', 'focus-visible:border-input'],
    ])(
      'applies %s focus style when variant is %s',
      (variant, expectedClass) => {
        render(<LocaleSwitcher variant={variant} />);

        expect(screen.getByRole('button').className).toContain(expectedClass);
      },
    );

    it('renders an empty label when the current locale is not supported', () => {
      localeRef.current = 'de';
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('');
    });
  });

  describe('locale switching', () => {
    it.each([
      [1, 'fr'],
      [0, 'en'],
    ])(
      'calls router.push with /test and locale %s when clicking item at index %i',
      async (index, locale) => {
        render(<LocaleSwitcher />);
        await openMenu();

        fireEvent.click(screen.getAllByRole('menuitem')[index]);

        expect(routerPushMock).toHaveBeenCalledWith('/test', { locale });
      },
    );
  });

  describe('locale items', () => {
    it('renders one item per supported locale', async () => {
      render(<LocaleSwitcher />);
      await openMenu();

      expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    });

    it('marks the active locale item with the active class', async () => {
      localeRef.current = 'fr';
      render(<LocaleSwitcher />);
      await openMenu();

      const items = screen.getAllByRole('menuitem');
      expect(items[1].className).toContain('bg-primary/3');
      expect(items[0].className).toContain('text-muted-foreground');
    });

    it('sets aria-label on each locale item', async () => {
      render(<LocaleSwitcher />);
      await openMenu();

      for (const item of screen.getAllByRole('menuitem')) {
        expect(item).toHaveAttribute('aria-label', 'Change language');
      }
    });

    it('sets data-testid with locale code on each item', async () => {
      render(<LocaleSwitcher />);
      await openMenu();

      const items = screen.getAllByRole('menuitem');
      expect(items[0]).toHaveAttribute(
        'data-testid',
        'locale-switcher-item-en',
      );
      expect(items[1]).toHaveAttribute(
        'data-testid',
        'locale-switcher-item-fr',
      );
    });
  });
});
