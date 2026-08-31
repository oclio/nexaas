import { expect, test } from '@playwright/test';

import enMessages from '@/../messages/en';
import frMessages from '@/../messages/fr';
import { supportedLocales } from '@/core/i18n/routing';

const messages = { en: enMessages, fr: frMessages } as const;

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

test.describe('LocaleSwitcher', () => {
  test('displays the current locale code on the trigger button', async ({
    page,
  }) => {
    for (const { code } of supportedLocales) {
      await page.goto(`/${code}`);

      await expect(page.getByTestId('locale-switcher-trigger')).toHaveText(
        capitalize(code),
      );
    }
  });

  test('switches from default to second locale and updates page content', async ({
    page,
  }) => {
    const [defaultLocale, secondLocale] = supportedLocales.map((l) => l.code);

    await page.goto(`/${defaultLocale}`);

    await page.getByTestId('locale-switcher-trigger').click();
    await page.getByTestId(`locale-switcher-item-${secondLocale}`).click();

    await expect(page).toHaveURL(new RegExp(`/${secondLocale}`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      messages[secondLocale].pages.landing.title,
    );
  });

  test('switches back from second locale to default', async ({ page }) => {
    const [defaultLocale, secondLocale] = supportedLocales.map((l) => l.code);

    await page.goto(`/${secondLocale}`);

    await page.getByTestId('locale-switcher-trigger').click();
    await page.getByTestId(`locale-switcher-item-${defaultLocale}`).click();

    await expect(page).toHaveURL(new RegExp(`/${defaultLocale}`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      messages[defaultLocale].pages.landing.title,
    );
  });

  test('persists the locale choice across page reloads', async ({ page }) => {
    const [defaultLocale, secondLocale] = supportedLocales.map((l) => l.code);

    await page.goto(`/${defaultLocale}`);

    await page.getByTestId('locale-switcher-trigger').click();
    await page.getByTestId(`locale-switcher-item-${secondLocale}`).click();

    await expect(page).toHaveURL(new RegExp(`/${secondLocale}`));

    await page.reload();

    await expect(page).toHaveURL(new RegExp(`/${secondLocale}`));
    await expect(page.getByTestId('locale-switcher-trigger')).toHaveText(
      capitalize(secondLocale),
    );
  });
});
