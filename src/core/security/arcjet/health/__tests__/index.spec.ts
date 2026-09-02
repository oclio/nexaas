import { vi } from 'vitest';

const { withTimeoutMock } = vi.hoisted(() => ({
  withTimeoutMock: vi.fn(<T>(promise: Promise<T>): Promise<T> => promise),
}));

vi.mock('@/core/async/helpers/with-timeout', () => ({
  withTimeout: withTimeoutMock,
}));

import { checkArcjetService } from '../index';

describe('checkArcjetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withTimeoutMock.mockImplementation(
      <T>(promise: Promise<T>): Promise<T> => promise,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns disabled when ARCJET_KEY is not set', async () => {
    vi.stubEnv('ARCJET_KEY', '');

    const result = await checkArcjetService();

    expect(result).toMatchObject({ status: 'disabled' });
  });

  it('returns healthy when fetch responds with status < 500', async () => {
    const key = 'test-arcjet-key';
    vi.stubEnv('ARCJET_KEY', key);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(undefined, { status: 200 }),
    );

    const result = await checkArcjetService();

    expect(result).toMatchObject({ status: 'healthy' });
    expect(fetch).toHaveBeenCalledWith('https://decide.arcjet.com', {
      method: 'HEAD',
      headers: { Authorization: `Bearer ${key}` },
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

      expect(result).toMatchObject({ status: 'unhealthy' });
    },
  );

  it('returns unhealthy with error message when fetch throws', async () => {
    vi.stubEnv('ARCJET_KEY', 'test-arcjet-key');
    const errorMessage = 'Connection refused';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error(errorMessage));

    const result = await checkArcjetService();

    expect(result).toMatchObject({
      status: 'unhealthy',
      error: expect.stringMatching(/^.+$/),
    });
    expect((result as { error: string }).error).toBe(errorMessage);
  });

  it('returns unhealthy with error message when timeout occurs', async () => {
    vi.stubEnv('ARCJET_KEY', 'test-arcjet-key');
    const errorMessage = 'Timeout exceeded';
    withTimeoutMock.mockRejectedValueOnce(new Error(errorMessage));

    const result = await checkArcjetService();

    expect(result).toMatchObject({
      status: 'unhealthy',
      error: expect.stringMatching(/^.+$/),
    });
    expect((result as { error: string }).error).toBe(errorMessage);
  });
});
