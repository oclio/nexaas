import { vi } from 'vitest';

import { sentryMocks } from '@/tests/unit/mocks/observability';

import { initSentry } from '../index';

describe('initSentry', () => {
  let originalSentryDsn: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    originalSentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    if (originalSentryDsn === undefined) {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    } else {
      process.env.NEXT_PUBLIC_SENTRY_DSN = originalSentryDsn;
    }
  });

  it('calls Sentry.init with development defaults', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', 'https://sentry.io/abc');

    initSentry();

    expect(sentryMocks.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: undefined,
        tracesSampleRate: 1,
        sendDefaultPii: false,
      }),
    );
  });

  it('calls Sentry.init with production config when DSN is set', () => {
    const dsn = 'https://sentry.io/abc';
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', dsn);

    initSentry();

    expect(sentryMocks.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn,
        tracesSampleRate: 0.1,
        sendDefaultPii: true,
      }),
    );
  });

  it('passes undefined DSN in production when not configured', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SENTRY_DSN', undefined as unknown as string);

    initSentry();

    expect(sentryMocks.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: undefined,
        tracesSampleRate: 0.1,
        sendDefaultPii: true,
      }),
    );
  });

  it('always enables logs', () => {
    initSentry();

    expect(sentryMocks.init).toHaveBeenCalledWith(
      expect.objectContaining({ enableLogs: true }),
    );
  });
});
