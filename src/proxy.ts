import { NextFetchEvent, NextRequest } from 'next/server';

import { chain } from '@/core/middlewares/chain';
import type { CustomMiddleware } from '@/core/middlewares/types';

const proxies: CustomMiddleware[] = [];

export const proxy = async (request: NextRequest, event: NextFetchEvent) => {
  const handler = chain(proxies);
  return handler(request, event);
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
