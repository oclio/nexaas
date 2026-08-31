import type { Logger } from 'drizzle-orm/logger';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { env } from '@/core/env';
import { logger } from '@/core/observability/axiom/server';

const client = postgres(env.DATABASE_URL, {
  max: env.DATABASE_POOL_MAX,
  idle_timeout: env.DATABASE_IDLE_TIMEOUT,
  connect_timeout: env.DATABASE_CONNECT_TIMEOUT,
});

class DrizzleLogger implements Logger {
  logQuery(query: string, parameters: unknown[]): void {
    logger.debug('Drizzle SQL Query', { query, params: parameters });
  }
}

export const db = drizzle(client, {
  logger: env.NODE_ENV === 'production' ? false : new DrizzleLogger(),
});
