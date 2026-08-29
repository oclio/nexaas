import { vi } from 'vitest';

const envReference = {
  NEXT_PUBLIC_SENTRY_DSN: undefined as string | undefined,
};

vi.mock('@/core/config/env', () => ({
  get env() {
    return envReference;
  },
}));

const sentryInitMock = vi.fn();
const replayIntegrationMock = vi.fn().mockReturnValue({ name: 'replay' });
const captureRouterTransitionStartMock = vi.fn();
vi.mock('@sentry/nextjs', () => ({
  init: sentryInitMock,
  replayIntegration: replayIntegrationMock,
  captureRouterTransitionStart: captureRouterTransitionStartMock,
}));

describe('instrumentation-client', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    envReference.NEXT_PUBLIC_SENTRY_DSN = undefined;
    vi.resetModules();
  });

  it('does not call Sentry.init in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/abc';

    await import('../instrumentation-client');

    expect(sentryInitMock).not.toHaveBeenCalled();
  });

  it('does not call Sentry.init in production when DSN is not set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    envReference.NEXT_PUBLIC_SENTRY_DSN = undefined;

    await import('../instrumentation-client');

    expect(sentryInitMock).not.toHaveBeenCalled();
  });

  it('calls Sentry.init with replay integration in production when DSN is set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/abc';

    await import('../instrumentation-client');

    expect(sentryInitMock).toHaveBeenCalledWith({
      dsn: 'https://sentry.io/abc',
      integrations: [{ name: 'replay' }],
      tracesSampleRate: 0.1,
      enableLogs: true,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      sendDefaultPii: false,
    });
    expect(replayIntegrationMock).toHaveBeenCalledOnce();
  });

  it('exports onRouterTransitionStart from Sentry', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const module_ = await import('../instrumentation-client');

    expect(module_.onRouterTransitionStart).toBe(
      captureRouterTransitionStartMock,
    );
  });
});
