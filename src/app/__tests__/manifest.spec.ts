import meta from '@/../messages/en/meta';
import { brand } from '@/config/brand';

import manifest from '../manifest';

describe('manifest', () => {
  it('uses the app title as name and short_name', () => {
    const result = manifest();

    expect(result.name).toBe(brand.title);
    expect(result.short_name).toBe(brand.title);
  });

  it('uses the english meta description', () => {
    const result = manifest();

    expect(result.description).toBe(meta.description);
  });

  it('declares a standalone display mode', () => {
    const result = manifest();

    expect(result.display).toBe('standalone');
  });

  it('starts at the root url', () => {
    const result = manifest();

    expect(result.start_url).toBe('/');
  });

  it.each([
    { field: 'sizes' as const, expected: ['192x192', '512x512'] },
    { field: 'type' as const, expected: ['image/png', 'image/png'] },
    {
      field: 'src' as const,
      expected: ['/images/logo-192.png', '/images/logo-512.png'],
    },
  ])('icons have correct $field', ({ field, expected }) => {
    const result = manifest();

    expect(
      result.icons?.map((icon) => icon[field as keyof typeof icon]),
    ).toEqual(expected);
  });

  it.each([
    { prop: 'background_color' as const, expected: '#0a0a0a' },
    { prop: 'theme_color' as const, expected: '#0a0a0a' },
  ])('uses $prop $expected', ({ prop, expected }) => {
    const result = manifest();

    expect(result[prop as keyof typeof result]).toBe(expected);
  });
});
