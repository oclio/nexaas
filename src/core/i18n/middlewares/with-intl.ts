import createMiddleware from 'next-intl/middleware';

import { routing } from '@/core/i18n/routing';
import type { CustomMiddleware } from '@/core/middlewares/types';

function resolveLocale(pathname: string): string {
  const segment = pathname.split('/').find(Boolean);
  return segment && routing.locales.includes(segment as never)
    ? segment
    : routing.defaultLocale;
}

export const withIntl: CustomMiddleware = async (request, _event, next) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/trpc')) {
    const locale =
      request.headers.get('x-locale') ??
      request.cookies.get('NEXT_LOCALE')?.value ??
      routing.defaultLocale;
    request.headers.set('x-locale', locale);

    const response = await next();
    response.headers.set('x-locale', locale);
    return response;
  }

  const handleIntl = createMiddleware(routing);
  const intlResponse = handleIntl(request);

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    intlResponse.headers.set('x-locale', resolveLocale(pathname));
    return intlResponse;
  }

  const response = await next();

  for (const [key, value] of intlResponse.headers) {
    response.headers.set(key, value);
  }
  response.headers.set('x-locale', resolveLocale(pathname));

  return response;
};
