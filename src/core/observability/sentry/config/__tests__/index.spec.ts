import { vi } from 'vitest';

const envReference = {
  NODE_ENV: 'development' as string,
  NEXT_PUBLIC_SENTRY_DSN: undefined as string | undefined,
};

vi.mock('@/core/config/env', () => ({
  get env() {
    return envReference;
  },
}));

const sentryInitMock = vi.fn();
vi.mock('@sentry/nextjs', () => ({
  init: sentryInitMock,
}));

const { initSentry } = await import('../index');

describe('initSentry', () => {
  afterEach(() => {
    vi.clearAllMocks();
    envReference.NODE_ENV = 'development';
    envReference.NEXT_PUBLIC_SENTRY_DSN = undefined;
  });

  it('calls Sentry.init with development defaults', () => {
    envReference.NODE_ENV = 'development';
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/abc';

    initSentry();

    expect(sentryInitMock).toHaveBeenCalledWith({
      dsn: undefined,
      tracesSampleRate: 1,
      enableLogs: true,
      sendDefaultPii: false,
    });
  });

  it('calls Sentry.init with production config when DSN is set', () => {
    envReference.NODE_ENV = 'production';
    envReference.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/abc';

    initSentry();

    expect(sentryInitMock).toHaveBeenCalledWith({
      dsn: 'https://sentry.io/abc',
      tracesSampleRate: 0.1,
      enableLogs: true,
      sendDefaultPii: true,
    });
  });

  it('passes undefined DSN in production when not configured', () => {
    envReference.NODE_ENV = 'production';
    envReference.NEXT_PUBLIC_SENTRY_DSN = undefined;

    initSentry();

    expect(sentryInitMock).toHaveBeenCalledWith({
      dsn: undefined,
      tracesSampleRate: 0.1,
      enableLogs: true,
      sendDefaultPii: true,
    });
  });

  it('always enables logs', () => {
    initSentry();

    expect(sentryInitMock).toHaveBeenCalledWith(
      expect.objectContaining({ enableLogs: true }),
    );
  });
});
