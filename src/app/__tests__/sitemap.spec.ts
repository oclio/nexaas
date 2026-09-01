import { env } from '@/core/env';
import { routing } from '@/core/i18n/routing';

const { default: sitemap } = await import('../sitemap');

describe('sitemap', () => {
  it('returns one entry per locale per route', () => {
    const result = sitemap();

    expect(result).toHaveLength(routing.locales.length);
  });

  it.each([
    {
      prop: 'url' as const,
      expected: `${env.NEXT_PUBLIC_APP_URL}/${routing.locales[0]}`,
    },
    { prop: 'changeFrequency' as const, expected: 'weekly' },
    { prop: 'priority' as const, expected: 1 },
  ])('sets $prop correctly on the first entry', ({ prop, expected }) => {
    const [entry] = sitemap();

    expect(entry[prop]).toBe(expected);
  });

  it('sets lastModified to a Date instance', () => {
    const [entry] = sitemap();

    expect(entry.lastModified).toBeInstanceOf(Date);
  });

  it('includes an alternates.languages entry per supported locale', () => {
    const [entry] = sitemap();
    const languages = entry.alternates?.languages ?? {};

    expect(Object.keys(languages)).toEqual(routing.locales);
    expect(languages[routing.locales[0]]).toBe(
      `${env.NEXT_PUBLIC_APP_URL}/${routing.locales[0]}`,
    );
  });

  it.each(routing.locales)(
    'builds correct url and alternates for locale %s',
    (locale) => {
      const result = sitemap();
      const entry = result.find(
        (item) => item.url === `${env.NEXT_PUBLIC_APP_URL}/${locale}`,
      );

      expect(entry).toBeDefined();
      expect(entry?.alternates?.languages?.[locale]).toBe(
        `${env.NEXT_PUBLIC_APP_URL}/${locale}`,
      );
    },
  );
});
