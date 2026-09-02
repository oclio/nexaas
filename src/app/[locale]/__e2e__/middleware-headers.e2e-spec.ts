import { expect, test } from '@playwright/test';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

test.describe('middleware headers', () => {
  test('sets x-locale on the response for a normal route', async ({ page }) => {
    const response = await page.goto('/en');

    expect(response?.headers()['x-locale']).toBe('en');
  });

  test('sets x-locale to fr for /fr route', async ({ page }) => {
    const response = await page.goto('/fr');

    expect(response?.headers()['x-locale']).toBe('fr');
  });

  for (const locale of ['en', 'fr']) {
    test(`sets x-pathname on the response for /${locale}`, async ({ page }) => {
      const response = await page.goto(`/${locale}`);

      expect(response?.headers()['x-pathname']).toBe(`/${locale}`);
    });
  }

  test('sets a non-empty Content-Security-Policy header', async ({ page }) => {
    const response = await page.goto('/en');

    expect(response?.headers()['content-security-policy']).toBeTruthy();
  });

  for (const header of [
    'x-frame-options',
    'x-content-type-options',
    'strict-transport-security',
    'referrer-policy',
    'permissions-policy',
  ]) {
    test(`sets ${header} header`, async ({ page }) => {
      const response = await page.goto('/en');

      expect(response?.headers()[header]).toBeTruthy();
    });
  }

  test('rejects POST with mismatched Origin (CSRF protection)', async ({
    request,
  }) => {
    const response = await request.post('/en', {
      headers: { origin: 'https://evil.com' },
    });

    expect(response.status()).toBe(403);
  });

  test('allows POST with matching Origin', async ({ request }) => {
    const response = await request.post('/en', {
      headers: { origin: appUrl },
    });

    expect(response.status()).not.toBe(403);
  });

  test('allows POST without Origin header (non-browser request)', async ({
    request,
  }) => {
    const response = await request.post('/en');

    expect(response.status()).not.toBe(403);
  });

  test('sets HttpOnly and SameSite on cookies when present', async ({
    page,
    context,
  }) => {
    await page.goto('/fr');

    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
    expect(localeCookie).toBeTruthy();
    expect(localeCookie?.httpOnly).toBe(true);
    expect(localeCookie?.sameSite).toBeTruthy();
  });
});
