import { logger } from '@/core/observability/axiom/server';
import { isAuthorizedEmail } from '@/core/security/email-whitelist';

export function filterRecipients(to: string | string[]): string[] {
  const recipients = Array.isArray(to) ? to : [to];
  const authorized = recipients.filter(isAuthorizedEmail);
  const blocked = recipients.length - authorized.length;

  if (blocked > 0) {
    logger.warn('Blocked unauthorized email recipients', {
      event: 'mailer.recipients.blocked',
      blocked,
      authorized: authorized.length,
    });
  }

  return authorized;
}
