import { withTimeout } from '@/core/async/helpers/with-timeout';
import { env } from '@/core/config/env';

export async function checkArcjetService() {
  if (!env.ARCJET_KEY) return { status: 'disabled' };
  try {
    // Quick ping to the Arcjet decision API
    const res = await withTimeout(
      fetch('https://decide.arcjet.com', {
        method: 'HEAD',
        headers: {
          Authorization: `Bearer ${env.ARCJET_KEY}`,
        },
      }),
    );
    return { status: res.status < 500 ? 'healthy' : 'unhealthy' };
  } catch (error) {
    return { status: 'unhealthy', error: (error as Error).message };
  }
}
