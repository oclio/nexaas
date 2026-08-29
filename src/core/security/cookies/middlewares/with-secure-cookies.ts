import type { CustomMiddleware } from '@/core/middlewares/types';

/**
 * Enforces secure attributes on all cookies in the response.
 *
 * - `HttpOnly` prevents JavaScript access (mitigates XSS cookie theft)
 * - `Secure` ensures cookies are only sent over HTTPS
 * - `SameSite=Strict` prevents cross-site request sending (complements CSRF)
 *
 * In development, `Secure` is omitted to allow HTTP localhost testing.
 */
export const withSecureCookies: CustomMiddleware = async (
  _request,
  _event,
  next,
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const response = await next();

  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) return response;

  const cookies = setCookie.split(/,(?=\s*[A-Za-z0-9_-]+=)/);
  const securedCookies = cookies.map((cookie) => {
    const parts = cookie.split(';').map((p) => p.trim());

    const attributes = parts.slice(1).map((p) => p.trim().toLowerCase());

    if (attributes.every((a) => a !== 'httponly')) parts.push('HttpOnly');
    if (attributes.every((a) => !a.startsWith('samesite')))
      parts.push('SameSite=Strict');
    if (attributes.every((a) => !a.startsWith('path'))) parts.push('Path=/');

    if (isProduction && attributes.every((a) => a !== 'secure')) {
      parts.push('Secure');
    }

    return parts.join('; ');
  });

  response.headers.delete('set-cookie');
  for (const cookie of securedCookies) {
    response.headers.append('set-cookie', cookie);
  }

  return response;
};
