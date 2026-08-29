'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Only send Web Vitals in production to save Axiom credit
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const traceId = new RegExp(/(?:^|;\s*)x-trace-id=([^;]+)/).exec(
      document.cookie,
    )?.[1];
    const body = JSON.stringify({ ...metric, traceId });

    // Use navigator.sendBeacon if available, otherwise fallback to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/web-vitals',
        new Blob([body], { type: 'application/json' }),
      );
    } else {
      fetch('/api/web-vitals', {
        body,
        method: 'POST',
        keepalive: true,
      });
    }
  });

  // eslint-disable-next-line unicorn/no-null
  return null;
}
