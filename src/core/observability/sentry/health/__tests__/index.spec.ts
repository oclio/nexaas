import { vi } from 'vitest';

const envReference = {
  NEXT_PUBLIC_SENTRY_DSN: undefined as string | undefined,
};

vi.mock('@/core/config/env', () => ({
  get env() {
    return envReference;
  },
}));

const getClientMock = vi.fn();
vi.mock('@sentry/nextjs', () => ({
  getClient: getClientMock,
}));

vi.mock('@/core/async/helpers/with-timeout', () => ({
  withTimeout: (promise: Promise<unknown>) => promise,
}));

const { checkSentryService } = await import('../index');

describe('checkSentryService', () => {
  afterEach(() => {
    vi.clearAllMocks();
    envReference.NEXT_PUBLIC_SENTRY_DSN = undefined;
  });

  it('returns disabled when DSN is not set', async () => {
    envReference.NEXT_PUBLIC_SENTRY_DSN = undefined;

    const result = await checkSentryService();

    expect(result).toEqual({ status: 'disabled' });
  });

  it('returns unhealthy when Sentry client is not initialized', async () => {
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/abc';
    getClientMock.mockReturnValue(undefined);

    const result = await checkSentryService();

    expect(result).toEqual({
      status: 'unhealthy',
      reason: 'Client not initialized',
    });
  });

  it('returns healthy when fetch responds with status < 500', async () => {
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/abc';
    getClientMock.mockReturnValue({});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(undefined, { status: 200 }),
    );

    const result = await checkSentryService();

    expect(result).toEqual({ status: 'healthy' });
  });

  it('returns unhealthy when fetch responds with status >= 500', async () => {
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/abc';
    getClientMock.mockReturnValue({});
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(undefined, { status: 503 }),
    );

    const result = await checkSentryService();

    expect(result).toEqual({ status: 'unhealthy' });
  });

  it('returns unhealthy with error message when fetch throws', async () => {
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/abc';
    getClientMock.mockReturnValue({});
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
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'not-a-url';
    getClientMock.mockReturnValue({});

    const result = await checkSentryService();

    expect(result.status).toBe('unhealthy');
    expect(typeof (result as { error: string }).error).toBe('string');
  });

  it('constructs fetch URL from DSN protocol and host', async () => {
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/abc';
    getClientMock.mockReturnValue({});
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(undefined, { status: 200 }));

    await checkSentryService();

    expect(fetchSpy).toHaveBeenCalledWith('https://sentry.io', {
      method: 'HEAD',
    });
  });
});
