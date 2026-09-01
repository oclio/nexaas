import { describe, expect, it } from 'vitest';

import meta from '@/../messages/en/meta';
import { app } from '@/config';

import manifest from '../manifest';

describe('manifest', () => {
  it('uses the app title as name and short_name', () => {
    const result = manifest();

    expect(result.name).toBe(app.title);
    expect(result.short_name).toBe(app.title);
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

  it('declares both PWA icons', () => {
    const result = manifest();
    const sizes = result.icons?.map((index) => index.sizes);

    expect(sizes).toEqual(['192x192', '512x512']);
  });

  it('uses png type for all icons', () => {
    const result = manifest();
    const types = result.icons?.map((index) => index.type);

    expect(types).toEqual(['image/png', 'image/png']);
  });

  it('points each icon to the matching logo file', () => {
    const result = manifest();
    const srcs = result.icons?.map((index) => index.src);

    expect(srcs).toEqual(['/images/logo-192.png', '/images/logo-512.png']);
  });

  it('uses a dark background color', () => {
    const result = manifest();

    expect(result.background_color).toBe('#0a0a0a');
  });

  it('uses a dark theme color', () => {
    const result = manifest();

    expect(result.theme_color).toBe('#0a0a0a');
  });
});
