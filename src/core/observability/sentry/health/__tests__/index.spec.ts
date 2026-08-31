import { vi } from 'vitest';

import { sentryMocks } from '@/tests/unit/mocks/observability';

const { checkSentryService } = await import('../index');

describe('checkSentryService', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns disabled when DSN is not set', async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    const result = await checkSentryService();

    expect(result).toEqual({ status: 'disabled' });
  });

  it('returns unhealthy when Sentry client is not initialized', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');
    sentryMocks.getClient.mockReturnValue(undefined);

    const result = await checkSentryService();

    expect(result).toEqual({
      status: 'unhealthy',
      reason: 'Client not initialized',
    });
  });

  it('returns healthy when fetch responds with status < 500', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');
    sentryMocks.getClient.mockReturnValue({});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(undefined, { status: 200 }),
    );

    const result = await checkSentryService();

    expect(result).toEqual({ status: 'healthy' });
  });

  it.each([500, 503])(
    'returns unhealthy when fetch responds with status %i',
    async (status) => {
      vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');
      sentryMocks.getClient.mockReturnValue({});
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(undefined, { status }),
      );

      const result = await checkSentryService();

      expect(result).toEqual({ status: 'unhealthy' });
    },
  );

  it('returns unhealthy with error message when fetch throws', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');
    sentryMocks.getClient.mockReturnValue({});
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('connection refused'),
    );

    const result = await checkSentryService();

    expect(result).toEqual({
      status: 'unhealthy',
      error: 'connection refused',
    });
  });

  it('returns unhealthy with error message on invalid DSN URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'not-a-url');
    sentryMocks.getClient.mockReturnValue({});

    const result = await checkSentryService();

    expect(result.status).toBe('unhealthy');
    expect(typeof (result as { error: string }).error).toBe('string');
  });

  it('constructs fetch URL from DSN protocol and host', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');
    sentryMocks.getClient.mockReturnValue({});
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(undefined, { status: 200 }));

    await checkSentryService();

    expect(fetchSpy).toHaveBeenCalledWith('https://sentry.io', {
      method: 'HEAD',
    });
  });
});
