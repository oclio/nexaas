import { z } from 'zod';

import { env } from '@/core/env';

const emailSchema = z.email();

const emailWhitelist = env.EMAIL_WHITELIST
  ? [
      ...new Set(
        env.EMAIL_WHITELIST.split(/[;,]/)
          .map((email) => email.trim().toLowerCase())
          .filter((email) => emailSchema.safeParse(email).success),
      ),
    ]
  : [];

/**
 * Checks if a given email is authorized based on the ALLOWED_EMAILS whitelist environment variable.
 * If the whitelist is empty or not configured, all emails are considered authorized.
 */
export function isAuthorizedEmail(email: string): boolean {
  if (emailWhitelist.length === 0) {
    return true;
  }

  return emailWhitelist.includes(email.trim().toLowerCase());
}
