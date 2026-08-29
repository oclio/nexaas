import { vi } from 'vitest';

vi.mock('@/core/config/env', () => ({
  env: {
    ARCJET_KEY: 'test-arcjet-key',
  },
}));

vi.mock('@/core/async/helpers/with-timeout', () => ({
  withTimeout: vi.fn((promise: Promise<Response>) => promise),
}));

const { checkArcjetService } = await import('../index');

describe('checkArcjetService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns disabled when ARCJET_KEY is not set', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { ARCJET_KEY: undefined },
    }));
    const { checkArcjetService: check } = await import('../index');

    const result = await check();

    expect(result).toEqual({ status: 'disabled' });
  });

  it('returns healthy when fetch responds with status < 500', async () => {
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

  it('returns unhealthy when fetch responds with status >= 500', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(undefined, { status: 503 }),
    );

    const result = await checkArcjetService();

    expect(result).toEqual({ status: 'unhealthy' });
  });

  it('returns unhealthy with error message when fetch throws', async () => {
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
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { ARCJET_KEY: 'test-arcjet-key' },
    }));
    vi.doMock('@/core/async/helpers/with-timeout', () => ({
      withTimeout: vi.fn(() => Promise.reject(new Error('Timeout exceeded'))),
    }));
    const { checkArcjetService: check } = await import('../index');

    const result = await check();

    expect(result).toEqual({
      status: 'unhealthy',
      error: 'Timeout exceeded',
    });
  });
});
