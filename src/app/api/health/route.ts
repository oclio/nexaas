import { NextRequest, NextResponse } from 'next/server';

import { env } from '@/core/config/env';
import { checkAxiomService } from '@/core/observability/axiom/health';
import { checkSentryService } from '@/core/observability/sentry/health';
import { checkArcjetService } from '@/core/security/arcjet/health';

enum Status {
  healthy = 'healthy',
  unhealthy = 'unhealthy',
  disabled = 'disabled',
  fulfilled = 'fulfilled',
}

async function checkServices() {
  const [security, logs, errorsCapture] = await Promise.allSettled([
    checkArcjetService(),
    checkAxiomService(),
    checkSentryService(),
  ]);

  const services = {
    security:
      security.status === Status.fulfilled
        ? security.value
        : { status: Status.unhealthy },
    logs:
      logs.status === Status.fulfilled
        ? logs.value
        : { status: Status.unhealthy },
    errorsCapture:
      errorsCapture.status === Status.fulfilled
        ? errorsCapture.value
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
    return NextResponse.json({ status: 'ok' });
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
