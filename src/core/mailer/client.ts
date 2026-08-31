import { Resend } from 'resend';

import { env } from '@/core/config/env';

export function getResendClient(): Resend {
  return new Resend(env.RESEND_API_KEY);
}
