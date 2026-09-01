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
  ])(
    'does not call Sentry.init when NODE_ENV=$nodeEnv and DSN is "$dsn"',
    async ({ nodeEnv, dsn }) => {
      vi.stubEnv('NODE_ENV', nodeEnv);
      vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', dsn);

      await import('../instrumentation-client');

      expect(sentryMocks.init).not.toHaveBeenCalled();
    },
  );

  it('calls Sentry.init with DSN and replay integration in production when DSN is set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');

    await import('../instrumentation-client');

    expect(sentryMocks.init).toHaveBeenCalledOnce();
    expect(sentryMocks.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://sentry.io/abc',
        integrations: [{ name: 'replay' }],
        enableLogs: true,
        sendDefaultPii: false,
      }),
    );
    expect(sentryMocks.replayIntegration).toHaveBeenCalledOnce();
  });

  it('exports onRouterTransitionStart from Sentry', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const module_ = await import('../instrumentation-client');

    expect(module_.onRouterTransitionStart).toBe(
      sentryMocks.captureRouterTransitionStart,
    );
  });
});
