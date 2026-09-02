import { act, renderHook } from '@testing-library/react';

import { useActiveSection } from '../use-active-section';

function mockElements(
  elements: Record<string, { top: number; bottom: number }>,
) {
  vi.spyOn(document, 'querySelector').mockImplementation((selector: string) => {
    const id = selector.slice(1);
    const element = elements[id];
    return element
      ? ({ getBoundingClientRect: () => element } as unknown as Element)
      : null;
  });
}

describe('useActiveSection', () => {
  let addEventListener: ReturnType<typeof vi.fn>;
  let removeEventListener: ReturnType<typeof vi.fn>;
  let scrollHandler: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    scrollHandler = undefined;
    addEventListener = vi.fn((_: string, handler: () => void) => {
      scrollHandler = handler;
    });
    removeEventListener = vi.fn();
    vi.spyOn(globalThis, 'addEventListener').mockImplementation(
      addEventListener as unknown as typeof window.addEventListener,
    );
    vi.spyOn(globalThis, 'removeEventListener').mockImplementation(
      removeEventListener as unknown as typeof window.removeEventListener,
    );
    Object.defineProperty(globalThis, 'scrollY', {
      writable: true,
      configurable: true,
      value: 100,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty string initially', () => {
    const { result } = renderHook(() => useActiveSection([]));

    expect(result.current).toBe('');
  });

  it('does not re-render when the initial state matches the computed state', () => {
    let renderCount = 0;
    renderHook(() => {
      renderCount++;
      return useActiveSection([]);
    });

    expect(renderCount).toBe(1);
  });

  it.each([
    {
      top: 150,
      bottom: 400,
      expected: 'features',
      label: 'top within the trigger line',
    },
    {
      top: 250,
      bottom: 600,
      expected: '',
      label: 'top below the trigger line',
    },
    {
      top: 100,
      bottom: 150,
      expected: '',
      label: 'bottom above the trigger line',
    },
  ])(
    'returns $expected when section is $label',
    ({ top, bottom, expected }) => {
      mockElements({ features: { top, bottom } });

      const { result } = renderHook(() => useActiveSection(['features']));

      expect(result.current).toBe(expected);
    },
  );

  it('returns empty string when scrolled near the top of the page', () => {
    mockElements({ features: { top: 150, bottom: 400 } });
    Object.defineProperty(globalThis, 'scrollY', { value: 20 });

    const { result } = renderHook(() => useActiveSection(['features']));

    expect(result.current).toBe('');
  });

  it('returns the last matching section when multiple sections overlap the trigger line', () => {
    mockElements({
      features: { top: 150, bottom: 400 },
      faq: { top: 180, bottom: 500 },
    });

    const { result } = renderHook(() => useActiveSection(['features', 'faq']));

    expect(result.current).toBe('faq');
  });

  it('skips empty ids in the section list', () => {
    mockElements({ features: { top: 150, bottom: 400 } });

    const { result } = renderHook(() => useActiveSection(['', 'features', '']));

    expect(result.current).toBe('features');
  });

  it('registers a scroll event listener on mount', () => {
    renderHook(() => useActiveSection(['features']));

    expect(addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true },
    );
  });

  it('removes the scroll event listener on unmount', () => {
    const { unmount } = renderHook(() => useActiveSection(['features']));

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );
  });

  it('returns the active section when its top is exactly at the trigger line', () => {
    mockElements({ features: { top: 200, bottom: 400 } });

    const { result } = renderHook(() => useActiveSection(['features']));

    expect(result.current).toBe('features');
  });

  it('does not return a section when its bottom is exactly at the trigger line', () => {
    mockElements({ features: { top: 100, bottom: 200 } });

    const { result } = renderHook(() => useActiveSection(['features']));

    expect(result.current).toBe('');
  });

  it('returns the active section when scrollY is exactly 50', () => {
    mockElements({ features: { top: 150, bottom: 400 } });
    Object.defineProperty(globalThis, 'scrollY', { value: 50 });

    const { result } = renderHook(() => useActiveSection(['features']));

    expect(result.current).toBe('features');
  });

  it('returns empty string initially before any scroll with no sections', () => {
    mockElements({});

    const { result } = renderHook(() => useActiveSection(['features']));

    expect(result.current).toBe('');
  });

  it('re-runs the effect when section ids change', () => {
    mockElements({ features: { top: 150, bottom: 400 } });

    const { result, rerender } = renderHook(
      ({ ids }) => useActiveSection(ids),
      { initialProps: { ids: ['features'] } },
    );

    expect(result.current).toBe('features');

    mockElements({ faq: { top: 150, bottom: 400 } });

    rerender({ ids: ['faq'] });

    expect(result.current).toBe('faq');
  });

  it('updates the active section when a scroll event fires', () => {
    mockElements({
      features: { top: 150, bottom: 400 },
      faq: { top: 250, bottom: 600 },
    });

    const { result } = renderHook(() => useActiveSection(['features', 'faq']));

    expect(result.current).toBe('features');

    mockElements({
      features: { top: 250, bottom: 600 },
      faq: { top: 150, bottom: 400 },
    });

    act(() => {
      scrollHandler?.();
    });

    expect(result.current).toBe('faq');
  });
});
