import { sentryMocks } from '@/tests/unit/mocks/observability';

describe('instrumentation-client', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('does not call Sentry.init in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');

    await import('../instrumentation-client');

    expect(sentryMocks.init).not.toHaveBeenCalled();
  });

  it('does not call Sentry.init in production when DSN is not set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', '');

    await import('../instrumentation-client');

    expect(sentryMocks.init).not.toHaveBeenCalled();
  });

  it('calls Sentry.init with replay integration in production when DSN is set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');

    await import('../instrumentation-client');

    expect(sentryMocks.init).toHaveBeenCalledWith({
      dsn: 'https://sentry.io/abc',
      integrations: [{ name: 'replay' }],
      tracesSampleRate: 0.1,
      enableLogs: true,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      sendDefaultPii: false,
    });
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
