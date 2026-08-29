import * as Sentry from '@sentry/nextjs';

import { withTimeout } from '@/core/async/helpers/with-timeout';
import { env } from '@/core/config/env';

export async function checkSentryService() {
  const dsn = env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return { status: 'disabled' };

  try {
    const client = Sentry.getClient();
    if (!client)
      return { status: 'unhealthy', reason: 'Client not initialized' };

    const dsnUrl = new URL(dsn);
    const res = await withTimeout(
      fetch(`${dsnUrl.protocol}//${dsnUrl.host}`, { method: 'HEAD' }),
    );

    return { status: res.status < 500 ? 'healthy' : 'unhealthy' };
  } catch (error) {
    return { status: 'unhealthy', error: (error as Error).message };
  }
}
