import { renderHook } from '@testing-library/react';

import { useIsMounted } from '../use-is-mounted';

describe('useIsMounted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true on the client', () => {
    const { result } = renderHook(() => useIsMounted());

    expect(result.current).toBe(true);
  });

  it('subscribe returns a callable cleanup function', async () => {
    let subscribeFunction: ((callback: () => void) => () => void) | undefined;
    vi.doMock('react', async () => {
      const actual = await vi.importActual<typeof import('react')>('react');
      return {
        ...actual,
        useSyncExternalStore: (
          subscribe: (callback: () => void) => () => void,
          isMounted: () => boolean,
        ) => {
          subscribeFunction = subscribe;
          return isMounted();
        },
      };
    });
    vi.resetModules();

    const { useIsMounted: useIsMountedMocked } =
      await import('../use-is-mounted');

    renderHook(() => useIsMountedMocked());

    const cleanup = subscribeFunction?.(vi.fn());

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup?.()).not.toThrow();

    vi.doUnmock('react');
    vi.resetModules();
  });

  describe('server snapshot', () => {
    afterEach(() => {
      vi.resetModules();
      vi.doUnmock('react');
    });

    it('returns false when not mounted', async () => {
      vi.doMock('react', async () => {
        const actual = await vi.importActual<typeof import('react')>('react');
        return {
          ...actual,
          useSyncExternalStore: (
            _subscribe: unknown,
            _getSnapshot: unknown,
            getServerSnapshot: unknown,
          ) => (getServerSnapshot as () => boolean)(),
        };
      });
      vi.resetModules();

      const { useIsMounted: useIsMountedMocked } =
        await import('../use-is-mounted');

      const { result } = renderHook(() => useIsMountedMocked());

      expect(result.current).toBe(false);
    });
  });
});
