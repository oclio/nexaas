import {
  axiomLoggerMock,
  sentryEdgeConfigLoaded,
  sentryMocks,
  sentryServerConfigLoaded,
} from '@/tests/unit/mocks/observability';

describe('instrumentation', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  describe('register', () => {
    it('imports sentry.server.config on nodejs runtime', async () => {
      vi.stubEnv('NEXT_RUNTIME', 'nodejs');

      const { register } = await import('../instrumentation');
      await register();

      expect(sentryServerConfigLoaded).toHaveBeenCalled();
      expect(sentryEdgeConfigLoaded).not.toHaveBeenCalled();
    });

    it('imports sentry.edge.config on edge runtime', async () => {
      vi.stubEnv('NEXT_RUNTIME', 'edge');

      const { register } = await import('../instrumentation');
      await register();

      expect(sentryEdgeConfigLoaded).toHaveBeenCalled();
      expect(sentryServerConfigLoaded).not.toHaveBeenCalled();
    });

    it('does nothing when NEXT_RUNTIME is not set', async () => {
      vi.stubEnv('NEXT_RUNTIME', '');

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

      expect(sentryMocks.captureRequestError).toHaveBeenCalledWith(
        error,
        request,
        errorContext,
      );
      expect(axiomLoggerMock.error).toHaveBeenCalledWith(
        'Unhandled request error',
        {
          err: error,
          method: 'POST',
          path: '/api/webhook',
          requestPath: '/api/webhook',
        },
      );
      expect(axiomLoggerMock.flush).toHaveBeenCalledOnce();
    });
  });
});
