import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { AppError } from '@/core/errors/app-error';
import { chain } from '@/core/middlewares/chain';
import stack from '@/proxy-stack';

export const proxy = async (request: NextRequest, event: NextFetchEvent) => {
  request.headers.set('x-pathname', request.nextUrl.pathname);

  const handler = chain(stack);
  try {
    const response = await handler(request, event);
    response.headers.set('x-pathname', request.nextUrl.pathname);
    return response;
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
