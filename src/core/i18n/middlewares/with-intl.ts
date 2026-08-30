import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from '@/core/i18n/routing';
import type { CustomMiddleware } from '@/core/middlewares/types';

export const withIntl: CustomMiddleware = async (request, _event, _next) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/trpc')) {
    const locale =
      request.headers.get('x-locale') ??
      request.cookies.get('NEXT_LOCALE')?.value ??
      routing.defaultLocale;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-locale', locale);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const handleIntl = createMiddleware(routing);
  return handleIntl(request);
};
