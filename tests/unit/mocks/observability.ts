import { vi } from 'vitest';

export const sentryMocks = {
  init: vi.fn(),
  replayIntegration: vi.fn().mockReturnValue({ name: 'replay' }),
  captureRouterTransitionStart: vi.fn(),
  captureRequestError: vi.fn(),
};

vi.mock('@sentry/nextjs', () => sentryMocks);

export const axiomLoggerMock = {
  error: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined),
};

vi.mock('@/core/observability/axiom/server', () => ({
  logger: axiomLoggerMock,
}));

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
