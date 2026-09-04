import { sentryMocks } from '@/tests/unit/mocks/observability';

describe('instrumentation-client', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it.each([
    { nodeEnv: 'development', dsn: 'https://sentry.io/abc' },
    { nodeEnv: 'production', dsn: '' },
    { nodeEnv: 'production', dsn: undefined },
  ])(
    'does not call Sentry.init when NODE_ENV=$nodeEnv and DSN is "$dsn"',
    async ({ nodeEnv, dsn }) => {
      vi.stubEnv('NODE_ENV', nodeEnv);
      if (dsn === undefined) {
        vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');
      } else {
        vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', dsn);
      }

      await import('@/instrumentation-client');

      expect(sentryMocks.init).not.toHaveBeenCalled();
    },
  );

  it('calls Sentry.init with DSN and replay integration in production when DSN is set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');

    await import('@/instrumentation-client');

    expect(sentryMocks.init).toHaveBeenCalled();
    const initCall = sentryMocks.init.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(initCall).toMatchObject({
      dsn: 'https://sentry.io/abc',
      integrations: expect.arrayContaining([expect.any(Object)]),
      enableLogs: true,
      sendDefaultPii: false,
    });
    expect(sentryMocks.replayIntegration).toHaveBeenCalled();
  });

  it('exports onRouterTransitionStart from Sentry', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const module_ = await import('@/instrumentation-client');

    expect(module_.onRouterTransitionStart).toBe(
      sentryMocks.captureRouterTransitionStart,
    );
  });
});
