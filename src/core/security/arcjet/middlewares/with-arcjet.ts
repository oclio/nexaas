import arcjet, { detectBot, shield, tokenBucket } from '@arcjet/next';
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

import { env } from '@/core/config/env';
import type { CustomMiddleware } from '@/core/middlewares/types';
import { logger } from '@/core/observability/axiom/server';

// Initialize Arcjet with global security rules (excluding chat-specific prompt scanning)
const aj = env.ARCJET_KEY
  ? arcjet({
      key: env.ARCJET_KEY,
      // In global middleware, we track clients by IP address ("ip.src") rather than "userId"
      // because requests are not yet authenticated when this middleware executes.
      characteristics: ['ip.src'],
      rules: [
        // Shield protects against common web attacks e.g. SQL injection, XSS
        shield({
          mode: env.ARCJET_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
        }),
        // Block all automated clients / bots
        detectBot({
          mode: env.ARCJET_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
          allow: ['GOOGLE_CRAWLER', 'BING_CRAWLER', 'CURL'],
        }),
        // Enforce rate limit bucket per IP (budget aligned with Sentry/Axiom doc recommendations)
        tokenBucket({
          mode: env.ARCJET_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
          refillRate: 300,
          interval: '1h',
          capacity: 100,
        }),
      ],
    })
  : undefined;

export const withArcjet: CustomMiddleware = async (request, event, next) => {
  if (!aj) {
    return next();
  }

  try {
    const decision = await aj.protect(request, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isBot()) {
        return new NextResponse('Automated clients are not permitted', {
          status: 403,
        });
      }
      if (decision.reason.isRateLimit()) {
        return new NextResponse('Rate limit exceeded', { status: 429 });
      }
      return new NextResponse('Forbidden', { status: 403 });
    }

    return await next();
  } catch (error) {
    // Fail-open strategy to prevent Arcjet outages from blocking legitimate traffic
    logger.error('Failed to evaluate request security with Arcjet', {
      event: 'security.arcjet.error',
      err: error,
    });

    Sentry.captureException(error, {
      tags: { service: 'arcjet' },
    });

    event.waitUntil(logger.flush());

    return await next();
  }
};
