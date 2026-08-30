import { expect, test } from '@playwright/test';

test.describe('LocaleSwitcher', () => {
  test('displays the current locale code on the trigger button', async ({
    page,
  }) => {
    await page.goto('/en');

    await expect(page.getByTestId('locale-switcher-trigger')).toHaveText('En');
  });

  test('switches from en to fr when selecting French', async ({ page }) => {
    await page.goto('/en');

    await page.getByTestId('locale-switcher-trigger').click();

    const frenchItem = page.getByTestId('locale-switcher-item-fr');
    await frenchItem.click();

    await expect(page).toHaveURL(/\/fr/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Bienvenue !',
    );
  });

  test('switches from fr to en when selecting English', async ({ page }) => {
    await page.goto('/fr');

    await page.getByTestId('locale-switcher-trigger').click();

    const englishItem = page.getByTestId('locale-switcher-item-en');
    await englishItem.click();

    await expect(page).toHaveURL(/\/en/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Welcome!',
    );
  });

  test('persists the locale choice across page reloads', async ({ page }) => {
    await page.goto('/en');

    await page.getByTestId('locale-switcher-trigger').click();
    await page.getByTestId('locale-switcher-item-fr').click();

    await expect(page).toHaveURL(/\/fr/);

    await page.reload();

    await expect(page).toHaveURL(/\/fr/);
    await expect(page.getByTestId('locale-switcher-trigger')).toHaveText('Fr');
  });
});
