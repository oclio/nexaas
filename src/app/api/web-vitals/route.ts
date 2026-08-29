import { NextResponse } from 'next/server';

import { env } from '@/core/config/env';
import { formatErrorMessage, getErrorMessage } from '@/core/errors/helpers';
import { axiomClient } from '@/core/observability/axiom/client';

export async function POST(request: Request) {
  try {
    if (env.NODE_ENV !== 'production') {
      return NextResponse.json({ status: 'ignored' });
    }

    if (!axiomClient || !env.AXIOM_DATASET) {
      return NextResponse.json({ status: 'ignored' });
    }

    const metric = (await request.json()) as object;

    await axiomClient.ingest(env.AXIOM_DATASET, {
      _time: new Date().toISOString(),
      type: 'web-vitals',
      ...metric,
    });
    await axiomClient.flush();

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: formatErrorMessage(getErrorMessage(error)),
      },
      { status: 500 },
    );
  }
}
