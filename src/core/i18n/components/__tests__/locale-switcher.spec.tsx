import { fireEvent, render, screen } from '@testing-library/react';

import LocaleSwitcher from '@/core/i18n/components/locale-switcher';

const { localeRef, routerPushMock } = vi.hoisted(() => ({
  localeRef: { current: 'en' as string },
  routerPushMock: vi.fn(),
}));

function translateLocaleSwitcher(key: string): string {
  const labels: Record<string, string> = {
    ariaLabel: 'Change language',
  };
  return labels[key] ?? key;
}

vi.mock('next-intl', () => ({
  useLocale: () => localeRef.current,
  useTranslations: () => translateLocaleSwitcher,
}));

vi.mock('@/core/i18n/navigation', () => ({
  usePathname: () => '/test',
  useRouter: () => ({ push: routerPushMock }),
}));

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
  });

  describe('rendering', () => {
    it('renders a button displaying the capitalized current locale code', () => {
      render(<LocaleSwitcher />);

      expect(screen.getByRole('button', { name: 'En' })).toBeInTheDocument();
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

    it('applies ghost focus style when variant is ghost', () => {
      render(<LocaleSwitcher variant="ghost" />);

      expect(screen.getByRole('button').className).toContain(
        'focus-visible:border-transparent',
      );
    });

    it('applies input focus style when variant is not ghost', () => {
      render(<LocaleSwitcher variant="outline" />);

      expect(screen.getByRole('button').className).toContain(
        'focus-visible:border-input',
      );
    });

    it('renders an empty label when the current locale is not supported', () => {
      localeRef.current = 'de';
      render(<LocaleSwitcher />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('');
    });
  });

  describe('locale switching', () => {
    it('calls router.push with pathname and new locale when a locale item is clicked', async () => {
      render(<LocaleSwitcher />);
      await openMenu();

      fireEvent.click(screen.getAllByRole('menuitem')[1]);

      expect(routerPushMock).toHaveBeenCalledOnce();
      expect(routerPushMock).toHaveBeenCalledWith('/test', { locale: 'fr' });
    });

    it('calls router.push even when clicking the active locale', async () => {
      render(<LocaleSwitcher />);
      await openMenu();

      fireEvent.click(screen.getAllByRole('menuitem')[0]);

      expect(routerPushMock).toHaveBeenCalledWith('/test', { locale: 'en' });
    });
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
  });
});
