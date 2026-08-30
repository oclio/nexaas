import { expect, test } from '@playwright/test';

test.describe('ThemeToggle', () => {
  test('toggles the dark class on <html> when clicked', async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByTestId('theme-toggle');
    await expect(toggle).toBeEnabled();

    await toggle.click();

    await expect(page.locator('html')).toHaveClass(/dark/);

    await toggle.click();

    await expect(page.locator('html')).toHaveClass(/light/);
  });

  test('persists the theme choice across page reloads', async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByTestId('theme-toggle');
    await expect(toggle).toBeEnabled();

    await toggle.click();

    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();

    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('applies a visually distinct background in dark mode', async ({
    page,
  }) => {
    await page.goto('/');

    const toggle = page.getByTestId('theme-toggle');
    await expect(toggle).toBeEnabled();

    await toggle.click();

    await expect(page.locator('html')).toHaveClass(/dark/);

    const darkBg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );

    await toggle.click();

    await expect(page.locator('html')).toHaveClass(/light/);

    const lightBg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );

    expect(darkBg).not.toBe(lightBg);
  });
});
