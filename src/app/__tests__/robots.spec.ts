import { describe, expect, it } from 'vitest';

import { env } from '@/core/env';

import robots from '../robots';

describe('robots', () => {
  it('allows all user agents to access the root', () => {
    const result = robots();

    expect(result.rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    });
  });

  it('points to the sitemap at the app url', () => {
    const result = robots();

    expect(result.sitemap).toBe(`${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`);
  });

  it('sets host to the app url', () => {
    const result = robots();

    expect(result.host).toBe(env.NEXT_PUBLIC_APP_URL);
  });
});
