import { vi } from 'vitest';

export const sentryMocks = {
  init: vi.fn(),
  replayIntegration: vi.fn().mockReturnValue({ name: 'replay' }),
  captureRouterTransitionStart: vi.fn(),
  captureRequestError: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  getClient: vi.fn(),
};

vi.mock('@sentry/nextjs', () => sentryMocks);

const useReportWebVitalsMock = vi.fn();

vi.mock('next/web-vitals', () => ({
  useReportWebVitals: (callback: (metric: Record<string, unknown>) => void) => {
    useReportWebVitalsMock(callback);
  },
}));

export { useReportWebVitalsMock };

export const axiomLoggerMock = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/core/observability/axiom/server', () => ({
  logger: axiomLoggerMock,
}));

const axiomClientReference: { value: unknown } = { value: undefined };

vi.mock('@/core/observability/axiom/client', () => ({
  get axiomClient() {
    return axiomClientReference.value;
  },
}));

export { axiomClientReference };

const sentryConfigMocks = vi.hoisted(() => ({
  server: vi.fn(),
  edge: vi.fn(),
}));

export const sentryServerConfigLoaded = sentryConfigMocks.server;
export const sentryEdgeConfigLoaded = sentryConfigMocks.edge;

vi.mock('@/../sentry.server.config', () => {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === 'then') sentryConfigMocks.server();
      },
    },
  );
});

vi.mock('@/../sentry.edge.config', () => {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === 'then') sentryConfigMocks.edge();
      },
    },
  );
});
