import { vi } from 'vitest';

const envDefaults: Record<string, unknown> = {
  DATABASE_CONNECT_TIMEOUT: 10,
  DATABASE_IDLE_TIMEOUT: 30,
  DATABASE_POOL_MAX: 10,
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5455/db',
  EMAIL_FROM: 'nexaas <noreply@nexaas.dev>',
  LOG_LEVEL: 'info',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  RESEND_API_KEY: 're_test_key_1234567890',
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
