import { expect, test } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'LandingPage',
    );
  });
});
