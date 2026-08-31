import { sql } from 'drizzle-orm';

import { withTimeout } from '@/core/async/helpers/with-timeout';

import { db } from '../index';

export async function checkDatabaseService() {
  try {
    await withTimeout(db.execute(sql`SELECT 1`), 3000);
    return { status: 'healthy' as const };
  } catch (error) {
    return { status: 'unhealthy' as const, error: (error as Error).message };
  }
}
