import type { ReactElement } from 'react';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  react?: ReactElement;
  template?: string;
  props?: Record<string, unknown>;
  preventThreading?: boolean;
}

export interface MailerResult {
  id: string;
}

export interface Mailer {
  send(options: SendEmailOptions): Promise<MailerResult>;
}
