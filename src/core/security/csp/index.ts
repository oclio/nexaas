export function buildCSP(
  nonce: string | null | undefined,
  isDevelopment: boolean,
  reportUri?: string,
): string {
  const scriptSource = [
    "'self'",
    ...(nonce ? [`'nonce-${nonce}'`, "'strict-dynamic'"] : ["'unsafe-inline'"]),
    'https://vercel.live',
    'https://va.vercel-scripts.com',
    ...(isDevelopment ? ["'unsafe-eval'"] : []),
  ].join(' ');

  const rules = [
    "default-src 'self'",
    `script-src ${scriptSource}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'self' https://vercel.live",
    "worker-src 'self' blob:",
    `connect-src 'self' https://*.sentry.io https://*.arcjet.com https://api.axiom.co https://va.vercel-scripts.com${isDevelopment ? ' ws: wss:' : ''}`,
    ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
    ...(reportUri ? [`report-uri ${reportUri}`, 'report-to csp-endpoint'] : []),
  ];

  return rules.join('; ');
}
