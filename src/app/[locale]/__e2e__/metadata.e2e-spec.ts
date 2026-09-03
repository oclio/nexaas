import { expect, test } from '@playwright/test';

import metaEn from '@/../messages/en/meta';
import pagesHelpEn from '@/../messages/en/pages-help';
import pagesProductEn from '@/../messages/en/pages-product';
import { brand } from '@/config/brand';
import { routing, supportedLocales } from '@/core/i18n/routing';

test('renders all layout metadata from en translations', async ({ page }) => {
  const landingDescription = pagesProductEn.landing.description
    .split('{app}')
    .join(brand.title);

  await page.goto(`/${routing.defaultLocale}`);

  await expect(page.locator('html')).toHaveAttribute(
    'lang',
    routing.defaultLocale,
  );
  await expect(page).toHaveTitle(
    `${pagesProductEn.landing.title} | ${brand.title}`,
  );

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    landingDescription,
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
    landingDescription,
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
  ).toHaveAttribute('content', landingDescription);

  const robots = await page
    .locator('meta[name="robots"]')
    .getAttribute('content');
  expect(robots).toContain('index');
  expect(robots).toContain('follow');

  const expectedKeywords = [
    ...new Set([...metaEn.keywords, ...pagesProductEn.landing.keywords]),
  ];
  const keywords = await page
    .locator('meta[name="keywords"]')
    .getAttribute('content');
  const renderedKeywords = keywords?.split(',').map((k) => k.trim()) ?? [];
  for (const keyword of expectedKeywords) {
    expect(renderedKeywords).toContain(keyword);
  }
});

test('renders faq page metadata merged with layout metadata', async ({
  page,
}) => {
  const faqDescription = pagesHelpEn.faq.description
    .split('{app}')
    .join(brand.title);

  await page.goto(`/${routing.defaultLocale}/faq`);

  await expect(page).toHaveTitle(`${pagesHelpEn.faq.title} | ${brand.title}`);

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    faqDescription,
  );

  const expectedKeywords = [
    ...new Set([...metaEn.keywords, ...pagesHelpEn.faq.keywords]),
  ];
  const keywords = await page
    .locator('meta[name="keywords"]')
    .getAttribute('content');
  const renderedKeywords = keywords?.split(',').map((k) => k.trim()) ?? [];
  for (const keyword of expectedKeywords) {
    expect(renderedKeywords).toContain(keyword);
  }
});
