import { createViewport } from '../create-viewport';

describe('createViewport', () => {
  it('sets width to device-width', () => {
    const viewport = createViewport();

    expect(viewport.width).toBe('device-width');
  });

  it('sets initialScale to 1', () => {
    const viewport = createViewport();

    expect(viewport.initialScale).toBe(1);
  });

  it.each([
    ['(prefers-color-scheme: light)', '#ffffff'],
    ['(prefers-color-scheme: dark)', '#0a0a0a'],
  ])('sets themeColor to %s for %s', (media, color) => {
    const viewport = createViewport();
    const themeColors = viewport.themeColor as {
      media: string;
      color: string;
    }[];

    const entry = themeColors.find((t) => t.media === media);
    expect(entry?.color).toBe(color);
  });
});
