import * as Sentry from '@sentry/nextjs';

import { env } from '@/core/env';

export function initSentry() {
  Sentry.init({
    dsn: env.NODE_ENV === 'production' ? env.NEXT_PUBLIC_SENTRY_DSN : undefined,

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: env.NODE_ENV === 'production',
  });
}
