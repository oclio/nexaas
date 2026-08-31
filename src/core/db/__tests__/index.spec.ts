import { vi } from 'vitest';

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

const { axiomLoggerMock } = await import('@/tests/unit/mocks/observability');

describe('db', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postgresCalls.url.length = 0;
    postgresCalls.options.length = 0;
    drizzleCalls.client.length = 0;
    drizzleCalls.config.length = 0;
    vi.resetModules();
  });

  it('creates a postgres client with the DATABASE_URL from env', async () => {
    await import('../index');

    expect(postgresCalls.url).toEqual([
      'postgresql://postgres:postgres@localhost:5455/db',
    ]);
  });

  it('passes pool configuration from env to the postgres client', async () => {
    await import('../index');

    expect(postgresCalls.options[0]).toMatchObject({
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
    });
  });

  it('creates a drizzle instance with the postgres client', async () => {
    await import('../index');

    expect(drizzleCalls.client[0]).toBe(postgresInstance);
  });

  it('exports the drizzle instance as db', async () => {
    const { db } = await import('../index');

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
    vi.unstubAllEnvs();

    const config = drizzleCalls.config[0];
    expect(config.logger).toBe(false);
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
});
