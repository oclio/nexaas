import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/core/config/env';
import { checkAxiomService } from '@/core/observability/axiom/health';

enum Status {
  healthy = 'healthy',
  unhealthy = 'unhealthy',
  disabled = 'disabled',
  fulfilled = 'fulfilled',
}

async function checkServices() {
  const [logs] = await Promise.allSettled([checkAxiomService()]);

  const services = {
    logs:
      logs.status === Status.fulfilled
        ? logs.value
        : { status: Status.unhealthy },
  };

  const isHealthy = Object.values(services).every(
    (s) => s.status === Status.healthy || s.status === Status.disabled,
  );

  return { isHealthy, services };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const secret = env.HEALTH_CHECK_SECRET;

  const isAuthorized =
    env.HEALTH_CHECK_SECRET &&
    Boolean(secret && authHeader === `Bearer ${secret}`);

  if (!isAuthorized) {
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }

  const { isHealthy, services } = await checkServices();

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
