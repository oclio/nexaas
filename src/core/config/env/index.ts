import { createEnv } from '@t3-oss/env-nextjs';
import z from 'zod';

export const env = createEnv({
  server: {
    // ─── ENVIRONMENT ─────────────────────────────────────────────────────────
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    // ─── SECURITY ────────────────────────────────────────────────────────────
    ARCJET_KEY: z.string().min(10).optional(),
    ARCJET_ENV: z
      .enum(['development', 'production', 'staging'])
      .default('development'),
    ALLOWED_EMAILS: z.string().default(''),

    // ─── OBSERVABILITY ───────────────────────────────────────────────────────
    AXIOM_TOKEN: z.string().min(10).optional(),
    AXIOM_DATASET: z.string().min(1).optional(),
    LOG_LEVEL: z
      .enum(['error', 'warn', 'info', 'debug', 'off'])
      .default('info'),
    HEALTH_CHECK_SECRET: z.string().min(10).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    !!process.env.VERCEL ||
    process.env.npm_lifecycle_event === 'build' ||
    process.env.NODE_ENV === 'test',
});
