import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { AppError } from '@/core/errors/app-error';
import { chain } from '@/core/middlewares/chain';
import type { CustomMiddleware } from '@/core/middlewares/types';
import { withAxiom } from '@/core/observability/axiom/middlewares/with-axiom';
import { withArcjet } from '@/core/security/arcjet/middlewares/with-arcjet';
import { withBodySizeLimit } from '@/core/security/body/middlewares/with-body-size-limit';
import { withSecureCookies } from '@/core/security/cookies/middlewares/with-secure-cookies';
import { withCsp } from '@/core/security/csp/middlewares/with-csp';
import { withCsrf } from '@/core/security/csrf/middlewares/with-csrf';

const proxies: CustomMiddleware[] = [
  withAxiom,
  withCsp,
  withCsrf,
  withBodySizeLimit,
  withArcjet,
  withSecureCookies,
];

export const proxy = async (request: NextRequest, event: NextFetchEvent) => {
  const handler = chain(proxies);
  try {
    return await handler(request, event);
  } catch (error) {
    const traceId = request.headers.get('x-trace-id') || undefined;
    const status = error instanceof AppError ? error.statusCode : 500;

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        traceId,
      },
      { status },
    );
  }
};

export default proxy;

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/_next`, `/_vercel`, or `/monitoring`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!_next|_vercel|monitoring|api/web-vitals|.*\\..*).*)',
    // Always run for API and tRPC routes (for trace ID, skip i18n inside middleware)
    '/(api|trpc)(.*)',
  ],
};
