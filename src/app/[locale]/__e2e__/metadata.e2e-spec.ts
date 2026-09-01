import { expect, test } from '@playwright/test';

import metaEn from '@/../messages/en/meta';
import pageLandingEn from '@/../messages/en/page-landing';
import { app } from '@/config';
import { routing, supportedLocales } from '@/core/i18n/routing';

test('renders all layout metadata from en translations', async ({ page }) => {
  await page.goto(`/${routing.defaultLocale}`);

  expect(await page.getAttribute('html', 'lang')).toBe(routing.defaultLocale);
  expect(await page.title()).toBe(
    `${pageLandingEn.landing.title} | ${app.title}`,
  );

  const description = await page
    .locator('meta[name="description"]')
    .getAttribute('content');
  expect(description).toBe(pageLandingEn.landing.description);

  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute('href');
  expect(canonical).toContain(`/${routing.defaultLocale}`);

  for (const { code } of supportedLocales) {
    const alternate = await page
      .locator(`link[rel="alternate"][hreflang="${code}"]`)
      .getAttribute('href');
    expect(alternate).toContain(`/${code}`);
  }

  const xDefault = await page
    .locator('link[rel="alternate"][hreflang="x-default"]')
    .getAttribute('href');
  expect(xDefault).toContain(`/${routing.defaultLocale}`);

  const ogLocale = await page
    .locator('meta[property="og:locale"]')
    .getAttribute('content');
  expect(ogLocale).toBe('en_US');

  const ogTitle = await page
    .locator('meta[property="og:title"]')
    .getAttribute('content');
  expect(ogTitle).toBe(pageLandingEn.landing.title);

  const ogDescription = await page
    .locator('meta[property="og:description"]')
    .getAttribute('content');
  expect(ogDescription).toBe(pageLandingEn.landing.description);

  const ogType = await page
    .locator('meta[property="og:type"]')
    .getAttribute('content');
  expect(ogType).toBe('website');

  const twitterCard = await page
    .locator('meta[name="twitter:card"]')
    .getAttribute('content');
  expect(twitterCard).toBe('summary_large_image');

  const twitterTitle = await page
    .locator('meta[name="twitter:title"]')
    .getAttribute('content');
  expect(twitterTitle).toBe(pageLandingEn.landing.title);

  const twitterDescription = await page
    .locator('meta[name="twitter:description"]')
    .getAttribute('content');
  expect(twitterDescription).toBe(pageLandingEn.landing.description);

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
