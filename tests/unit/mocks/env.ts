import { vi } from 'vitest';

const envDefaults: Record<string, unknown> = {
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
