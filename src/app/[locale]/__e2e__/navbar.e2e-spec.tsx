import { expect, test } from '@playwright/test';

test.describe('Navbar', () => {
  test('renders the navbar on the landing page', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByTestId('navbar')).toBeVisible();
  });

  test('renders the navbar on a non-landing page', async ({ page }) => {
    await page.goto('/en/faq');

    await expect(page.getByTestId('navbar')).toBeVisible();
  });

  test('scrolls to the features section when clicking the features link', async ({
    page,
  }) => {
    await page.goto('/en');

    await page.getByRole('link', { name: 'Features' }).first().click();

    await expect(page.locator('#features-section')).toBeVisible();
  });

  test('scrolls to the pricing section when clicking the pricing link', async ({
    page,
  }) => {
    await page.goto('/en');

    await page.getByRole('link', { name: 'Pricing' }).first().click();

    await expect(page.locator('#pricing-section')).toBeVisible();
  });

  test.describe('mobile menu', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('opens the mobile menu and displays navigation links', async ({
      page,
    }) => {
      await page.goto('/en');

      await page.getByRole('button', { name: 'Menu' }).click();

      const sheetContent = page.locator('[data-slot="sheet-content"]');
      await expect(sheetContent).toBeVisible();

      await expect(sheetContent.getByText('Features')).toBeVisible();
      await expect(sheetContent.getByText('Pricing')).toBeVisible();
    });

    test('navigates to a section after clicking a link in the mobile menu', async ({
      page,
    }) => {
      await page.goto('/en');

      await page.getByRole('button', { name: 'Menu' }).click();

      const sheetContent = page.locator('[data-slot="sheet-content"]');
      await expect(sheetContent).toBeVisible();

      await sheetContent.getByRole('link', { name: 'Features' }).click();

      await expect(page).toHaveURL(/#features-section/);
    });
  });
});
