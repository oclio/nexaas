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
    it.each([
      {
        runtime: 'nodejs',
        loaded: sentryServerConfigLoaded,
        notLoaded: sentryEdgeConfigLoaded,
      },
      {
        runtime: 'edge',
        loaded: sentryEdgeConfigLoaded,
        notLoaded: sentryServerConfigLoaded,
      },
    ])(
      'imports $runtime config on $runtime runtime',
      async ({ runtime, loaded, notLoaded }) => {
        vi.stubEnv('NEXT_RUNTIME', runtime);

        const { register } = await import('../instrumentation');
        await register();

        expect(loaded).toHaveBeenCalled();
        expect(notLoaded).not.toHaveBeenCalled();
      },
    );

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
        expect.objectContaining({
          err: error,
          method: 'POST',
          path: '/api/webhook',
        }),
      );
      expect(axiomLoggerMock.flush).toHaveBeenCalledOnce();
    });

    it('rejects when logger.flush rejects', async () => {
      axiomLoggerMock.flush.mockRejectedValueOnce(new Error('flush failed'));

      const { onRequestError } = await import('../instrumentation');

      const error = new Error('Something broke');
      const request = { method: 'GET', path: '/' } as never;
      const errorContext = {} as never;

      await expect(
        onRequestError(error, request, errorContext),
      ).rejects.toThrow('flush failed');
    });
  });
});
