// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server is running.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { initSentry } from '@/core/observability/sentry/config';

initSentry();
