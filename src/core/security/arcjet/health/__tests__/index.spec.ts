import { vi } from 'vitest';

const { withTimeoutMock } = vi.hoisted(() => ({
  withTimeoutMock: vi.fn(<T>(promise: Promise<T>): Promise<T> => promise),
}));

vi.mock('@/core/async/helpers/with-timeout', () => ({
  withTimeout: withTimeoutMock,
}));

const { checkArcjetService } = await import('../index');

describe('checkArcjetService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns disabled when ARCJET_KEY is not set', async () => {
    vi.stubEnv('ARCJET_KEY', '');

    const result = await checkArcjetService();

    expect(result).toEqual({ status: 'disabled' });
  });

  it('returns healthy when fetch responds with status < 500', async () => {
    vi.stubEnv('ARCJET_KEY', 'test-arcjet-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(undefined, { status: 200 }),
    );

    const result = await checkArcjetService();

    expect(result).toEqual({ status: 'healthy' });
    expect(fetch).toHaveBeenCalledWith('https://decide.arcjet.com', {
      method: 'HEAD',
      headers: { Authorization: 'Bearer test-arcjet-key' },
    });
  });

  it.each([500, 503])(
    'returns unhealthy when fetch responds with status %i',
    async (status) => {
      vi.stubEnv('ARCJET_KEY', 'test-arcjet-key');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(undefined, { status }),
      );

      const result = await checkArcjetService();

      expect(result).toEqual({ status: 'unhealthy' });
    },
  );

  it('returns unhealthy with error message when fetch throws', async () => {
    vi.stubEnv('ARCJET_KEY', 'test-arcjet-key');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('Connection refused'),
    );

    const result = await checkArcjetService();

    expect(result).toEqual({
      status: 'unhealthy',
      error: 'Connection refused',
    });
  });

  it('returns unhealthy with error message when timeout occurs', async () => {
    vi.stubEnv('ARCJET_KEY', 'test-arcjet-key');
    withTimeoutMock.mockRejectedValueOnce(new Error('Timeout exceeded'));

    const result = await checkArcjetService();

    expect(result).toEqual({
      status: 'unhealthy',
      error: 'Timeout exceeded',
    });
  });
});
