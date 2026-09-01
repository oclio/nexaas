import { describe, expect, it } from 'vitest';

import { env } from '@/core/env';
import { routing } from '@/core/i18n/routing';

import sitemap from '../sitemap';

describe('sitemap', () => {
  it('returns one entry per locale per route', () => {
    const result = sitemap();

    expect(result).toHaveLength(routing.locales.length);
  });

  it('builds the url from env and locale', () => {
    const [entry] = sitemap();

    expect(entry.url).toBe(`${env.NEXT_PUBLIC_APP_URL}/${routing.locales[0]}`);
  });

  it('sets changeFrequency to weekly for the home route', () => {
    const [entry] = sitemap();

    expect(entry.changeFrequency).toBe('weekly');
  });

  it('sets priority to 1 for the home route', () => {
    const [entry] = sitemap();

    expect(entry.priority).toBe(1);
  });

  it('includes an alternates.languages entry per supported locale', () => {
    const [entry] = sitemap();
    const languages = entry.alternates?.languages ?? {};

    expect(Object.keys(languages)).toEqual(routing.locales);
    expect(languages[routing.locales[0]]).toBe(
      `${env.NEXT_PUBLIC_APP_URL}/${routing.locales[0]}`,
    );
  });

  it('sets lastModified to a Date instance', () => {
    const [entry] = sitemap();

    expect(entry.lastModified).toBeInstanceOf(Date);
  });
});
