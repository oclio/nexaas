import { expect, test } from '@playwright/test';

test.describe('Landing Page', () => {
  test('displays the heading in the default locale (en)', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Welcome!',
    );
  });

  test('displays the heading in French when visiting /fr', async ({ page }) => {
    await page.goto('/fr');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Bienvenue !',
    );
  });

  test('redirects / to the default locale', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/en/);
  });

  test('sets the document title from generateMetadata', async ({ page }) => {
    await page.goto('/en');

    await expect(page).toHaveTitle(/Welcome!/);
  });
});
