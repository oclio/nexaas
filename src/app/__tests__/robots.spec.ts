import { env } from '@/core/env';

const { default: robots } = await import('../robots');

describe('robots', () => {
  it('allows all user agents to access the root', () => {
    const result = robots();

    expect(result.rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    });
  });

  it.each([
    {
      prop: 'sitemap' as const,
      expected: `${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
    },
    { prop: 'host' as const, expected: env.NEXT_PUBLIC_APP_URL },
  ])('sets $prop to $expected', ({ prop, expected }) => {
    const result = robots();

    expect(result[prop as keyof typeof result]).toBe(expected);
  });
});
