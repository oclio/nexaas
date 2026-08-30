import { vi } from 'vitest';

import { sentryMocks } from '@/tests/unit/mocks/observability';

const { initSentry } = await import('../index');

describe('initSentry', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it('calls Sentry.init with development defaults', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');

    initSentry();

    expect(sentryMocks.init).toHaveBeenCalledWith({
      dsn: undefined,
      tracesSampleRate: 1,
      enableLogs: true,
      sendDefaultPii: false,
    });
  });

  it('calls Sentry.init with production config when DSN is set', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');

    initSentry();

    expect(sentryMocks.init).toHaveBeenCalledWith({
      dsn: 'https://sentry.io/abc',
      tracesSampleRate: 0.1,
      enableLogs: true,
      sendDefaultPii: true,
    });
  });

  it('passes undefined DSN in production when not configured', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;

    initSentry();

    expect(sentryMocks.init).toHaveBeenCalledWith({
      dsn: undefined,
      tracesSampleRate: 0.1,
      enableLogs: true,
      sendDefaultPii: true,
    });
  });

  it('always enables logs', () => {
    initSentry();

    expect(sentryMocks.init).toHaveBeenCalledWith(
      expect.objectContaining({ enableLogs: true }),
    );
  });
});
