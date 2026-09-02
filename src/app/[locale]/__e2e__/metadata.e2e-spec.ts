import { expect, test } from '@playwright/test';

import metaEn from '@/../messages/en/meta';
import pagesProductEn from '@/../messages/en/pages-product';
import { app } from '@/config';
import { routing, supportedLocales } from '@/core/i18n/routing';

test('renders all layout metadata from en translations', async ({ page }) => {
  await page.goto(`/${routing.defaultLocale}`);

  await expect(page.locator('html')).toHaveAttribute(
    'lang',
    routing.defaultLocale,
  );
  await expect(page).toHaveTitle(
    `${pagesProductEn.landing.title} | ${app.title}`,
  );

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    pagesProductEn.landing.description,
  );

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new RegExp(`/${routing.defaultLocale}$`),
  );

  for (const { code } of supportedLocales) {
    await expect(
      page.locator(`link[rel="alternate"][hreflang="${code}"]`),
    ).toHaveAttribute('href', new RegExp(`/${code}$`));
  }

  await expect(
    page.locator('link[rel="alternate"][hreflang="x-default"]'),
  ).toHaveAttribute('href', new RegExp(`/${routing.defaultLocale}$`));

  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    'content',
    'en_US',
  );

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    pagesProductEn.landing.title,
  );

  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    pagesProductEn.landing.description,
  );

  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    'content',
    'website',
  );

  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );

  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    'content',
    pagesProductEn.landing.title,
  );

  await expect(
    page.locator('meta[name="twitter:description"]'),
  ).toHaveAttribute('content', pagesProductEn.landing.description);

  const robots = await page
    .locator('meta[name="robots"]')
    .getAttribute('content');
  expect(robots).toContain('index');
  expect(robots).toContain('follow');

  const expectedKeywords = [...new Set([...app.keywords, ...metaEn.keywords])];
  const keywords = await page
    .locator('meta[name="keywords"]')
    .getAttribute('content');
  const renderedKeywords = keywords?.split(',').map((k) => k.trim()) ?? [];
  for (const keyword of expectedKeywords) {
    expect(renderedKeywords).toContain(keyword);
  }
});
