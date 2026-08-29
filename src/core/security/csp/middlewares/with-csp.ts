import { env } from '@/core/config/env';
import type { CustomMiddleware } from '@/core/middlewares/types';
import { buildCSP } from '@/core/security/csp';

const dynamicPaths = ['/dashboard'];

function getSentryCspReportUrl(): string | undefined {
  const dsn = env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return undefined;

  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace('/', '');
    return `https://sentry.io/api/${projectId}/security/?sentry_key=${publicKey}`;
  } catch {
    return undefined;
  }
}

export const withCsp: CustomMiddleware = async (request, _event, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDynamic = dynamicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  const nonce = isDynamic
    ? btoa(crypto.randomUUID().replaceAll('-', ''))
    : undefined;

  if (nonce) {
    request.headers.set('x-nonce', nonce);
  }

  const reportUri = getSentryCspReportUrl();
  const response = await next();
  response.headers.set(
    'Content-Security-Policy',
    buildCSP(nonce, isDevelopment, reportUri),
  );

  if (reportUri) {
    response.headers.set('Reporting-Endpoints', `csp-endpoint="${reportUri}"`);
  }

  return response;
};
