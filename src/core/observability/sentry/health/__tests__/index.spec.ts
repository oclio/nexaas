import { vi } from 'vitest';

import { sentryMocks } from '@/tests/unit/mocks/observability';

import { checkSentryService } from '../index';

describe('checkSentryService', () => {
  let originalSentryDsn: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    originalSentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    if (originalSentryDsn === undefined) {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    } else {
      process.env.NEXT_PUBLIC_SENTRY_DSN = originalSentryDsn;
    }
  });

  it('returns disabled when DSN is not set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', undefined as unknown as string);

    const result = await checkSentryService();

    expect(result).toMatchObject({ status: 'disabled' });
  });

  it('returns unhealthy when Sentry client is not initialized', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');
    sentryMocks.getClient.mockReturnValue(undefined);

    const result = await checkSentryService();

    expect(result).toMatchObject({
      status: 'unhealthy',
      reason: expect.stringMatching(/^.+$/),
    });
  });

  it('returns healthy when fetch responds with status < 500', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');
    sentryMocks.getClient.mockReturnValue({});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(undefined, { status: 200 }),
    );

    const result = await checkSentryService();

    expect(result).toMatchObject({ status: 'healthy' });
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

      expect(result).toMatchObject({ status: 'unhealthy' });
    },
  );

  it('returns unhealthy with error message when fetch throws', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');
    sentryMocks.getClient.mockReturnValue({});
    const errorMessage = 'connection refused';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error(errorMessage));

    const result = await checkSentryService();

    expect(result).toMatchObject({
      status: 'unhealthy',
      error: expect.stringMatching(/^.+$/),
    });
    expect((result as { error: string }).error).toBe(errorMessage);
  });

  it('returns unhealthy with error message on invalid DSN URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'not-a-url');
    sentryMocks.getClient.mockReturnValue({});

    const result = await checkSentryService();

    expect(result).toMatchObject({
      status: 'unhealthy',
      error: expect.stringMatching(/^.+$/),
    });
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
