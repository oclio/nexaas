import { routing } from '@/core/i18n/routing';
import type { CustomMiddleware } from '@/core/middlewares/types';

export const withSeo: CustomMiddleware = async (request, _event, next) => {
  const { pathname } = request.nextUrl;

  const segments = pathname.split('/').filter(Boolean);
  const hasLocale = routing.locales.includes(segments[0] as never);
  const locale = hasLocale ? segments[0] : routing.defaultLocale;
  const pathSegments = hasLocale ? segments.slice(1) : segments;
  const pagePath = pathSegments.length > 0 ? '/' + pathSegments.join('/') : '';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);
  requestHeaders.set('x-path', pagePath);

  const response = await next();
  response.headers.set('x-locale', locale);
  response.headers.set('x-path', pagePath);

  return response;
};
