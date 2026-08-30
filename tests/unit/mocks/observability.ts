/* eslint-disable unicorn/no-top-level-side-effects */
import { vi } from 'vitest';

const envDefaults: Record<string, unknown> = {
  NODE_ENV: 'test',
  ARCJET_ENV: 'development',
  EMAIL_WHITELIST: '',
  LOG_LEVEL: 'info',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};

vi.mock('@/core/config/env', () => ({
  env: new Proxy(envDefaults, {
    get(target, property: string) {
      return Object.prototype.hasOwnProperty.call(target, property)
        ? target[property]
        : process.env[property];
    },
  }),
}));

export const sentryMocks = {
  init: vi.fn(),
  replayIntegration: vi.fn().mockReturnValue({ name: 'replay' }),
  captureRouterTransitionStart: vi.fn(),
};

vi.mock('@sentry/nextjs', () => sentryMocks);
