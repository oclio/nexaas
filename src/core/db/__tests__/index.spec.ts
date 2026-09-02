import { vi } from 'vitest';

import { env } from '@/core/env';
import { axiomLoggerMock } from '@/tests/unit/mocks/observability';

const { postgresInstance, drizzleInstance } = vi.hoisted(() => ({
  postgresInstance: {},
  drizzleInstance: {},
}));

const postgresCalls = vi.hoisted(() => ({
  options: [] as Record<string, unknown>[],
  url: [] as string[],
}));

vi.mock('postgres', () => ({
  default: (url: string, options: Record<string, unknown>) => {
    postgresCalls.url.push(url);
    postgresCalls.options.push(options);
    return postgresInstance;
  },
}));

const drizzleCalls = vi.hoisted(() => ({
  client: [] as unknown[],
  config: [] as Record<string, unknown>[],
}));

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: (client: unknown, config: Record<string, unknown>) => {
    drizzleCalls.client.push(client);
    drizzleCalls.config.push(config);
    return drizzleInstance;
  },
}));

describe('db', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postgresCalls.url.length = 0;
    postgresCalls.options.length = 0;
    drizzleCalls.client.length = 0;
    drizzleCalls.config.length = 0;
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('initializes db with env configuration', async () => {
    const { db } = await import('../index');

    expect(postgresCalls.url[0]).toBe(env.DATABASE_URL);
    expect(postgresCalls.options[0]).toMatchObject({
      max: env.DATABASE_POOL_MAX,
      idle_timeout: env.DATABASE_IDLE_TIMEOUT,
      connect_timeout: env.DATABASE_CONNECT_TIMEOUT,
    });
    expect(drizzleCalls.client[0]).toBe(postgresInstance);
    expect(db).toBe(drizzleInstance);
  });

  it('enables the DrizzleLogger in non-production environments', async () => {
    await import('../index');

    const config = drizzleCalls.config[0];
    expect(config.logger).toBeTypeOf('object');
    expect(config.logger).not.toBe(false);
  });

  it('disables the logger in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    await import('../index');

    const config = drizzleCalls.config[0];
    expect(config.logger).toBeFalsy();
  });
});

describe('DrizzleLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    drizzleCalls.config.length = 0;
    vi.resetModules();
  });

  it('logs queries to the axiom logger at debug level', async () => {
    await import('../index');

    const config = drizzleCalls.config[0];
    const loggerInstance = config.logger as {
      logQuery: (query: string, parameters: unknown[]) => void;
    };

    loggerInstance.logQuery('SELECT * FROM users', [1, 'alice']);

    expect(axiomLoggerMock.debug).toHaveBeenCalledWith('Drizzle SQL Query', {
      query: 'SELECT * FROM users',
      params: [1, 'alice'],
    });
  });

  it('logs queries with empty parameters', async () => {
    await import('../index');

    const config = drizzleCalls.config[0];
    const loggerInstance = config.logger as {
      logQuery: (query: string, parameters: unknown[]) => void;
    };

    loggerInstance.logQuery('SELECT 1', []);

    expect(axiomLoggerMock.debug).toHaveBeenCalledWith('Drizzle SQL Query', {
      query: 'SELECT 1',
      params: [],
    });
  });
});
