import { vi } from 'vitest';

const loggerMock = {
  error: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined),
};
vi.mock('@/core/observability/axiom/server', () => ({
  logger: loggerMock,
}));

const captureRequestErrorMock = vi.fn();
vi.mock('@sentry/nextjs', () => ({
  captureRequestError: captureRequestErrorMock,
  init: vi.fn(),
  replayIntegration: vi.fn().mockReturnValue({ name: 'replay' }),
  captureRouterTransitionStart: vi.fn(),
}));

const sentryServerConfigLoaded = vi.fn();
vi.mock('../../sentry.server.config', () => {
  sentryServerConfigLoaded();
  return {};
});

const sentryEdgeConfigLoaded = vi.fn();
vi.mock('../../sentry.edge.config', () => {
  sentryEdgeConfigLoaded();
  return {};
});

describe('instrumentation', () => {
  const originalNextRuntime = process.env.NEXT_RUNTIME;

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.NEXT_RUNTIME = originalNextRuntime;
  });

  describe('register', () => {
    it('imports sentry.server.config on nodejs runtime', async () => {
      process.env.NEXT_RUNTIME = 'nodejs';

      const { register } = await import('../instrumentation');
      await register();

      expect(sentryServerConfigLoaded).toHaveBeenCalled();
    });

    it('imports sentry.edge.config on edge runtime', async () => {
      process.env.NEXT_RUNTIME = 'edge';

      const { register } = await import('../instrumentation');
      await register();

      expect(sentryEdgeConfigLoaded).toHaveBeenCalled();
    });

    it('does nothing when NEXT_RUNTIME is not set', async () => {
      process.env.NEXT_RUNTIME = undefined;

      const { register } = await import('../instrumentation');
      await register();

      expect(sentryServerConfigLoaded).not.toHaveBeenCalled();
      expect(sentryEdgeConfigLoaded).not.toHaveBeenCalled();
    });
  });

  describe('onRequestError', () => {
    it('captures error in Sentry and logs to Axiom then flushes', async () => {
      const { onRequestError } = await import('../instrumentation');

      const error = new Error('Something broke');
      const request = { method: 'POST', path: '/api/webhook' } as never;
      const errorContext = { requestPath: '/api/webhook' } as never;

      await onRequestError(error, request, errorContext);

      expect(captureRequestErrorMock).toHaveBeenCalledWith(
        error,
        request,
        errorContext,
      );
      expect(loggerMock.error).toHaveBeenCalledWith('Unhandled request error', {
        err: error,
        method: 'POST',
        path: '/api/webhook',
        requestPath: '/api/webhook',
      });
      expect(loggerMock.flush).toHaveBeenCalledOnce();
    });
  });
});
