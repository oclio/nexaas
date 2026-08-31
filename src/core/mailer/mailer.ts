import { randomUUID } from 'node:crypto';

import * as Sentry from '@sentry/nextjs';

import { env } from '@/core/config/env';
import { logger } from '@/core/observability/axiom/server';

import { getResendClient } from './client';
import { renderTemplate } from './render';
import type { MailerResult, SendEmailOptions } from './types';
import { filterRecipients } from './whitelist';

export async function sendEmail(
  options: SendEmailOptions,
): Promise<MailerResult> {
  const recipients = filterRecipients(options.to);

  if (recipients.length === 0) {
    logger.info('No authorized recipients, skipping send', {
      event: 'mailer.send.skipped',
      subject: options.subject,
    });
    return { id: 'skipped' };
  }

  const baseOptions = {
    from: env.EMAIL_FROM,
    to: recipients,
    subject: options.subject,
  };

  let emailOptions: Parameters<
    ReturnType<typeof getResendClient>['emails']['send']
  >[0];

  if (options.template) {
    emailOptions = {
      ...baseOptions,
      react: await renderTemplate(options.template, options.props),
    };
  } else if (options.react) {
    emailOptions = { ...baseOptions, react: options.react };
  } else if (options.html) {
    emailOptions = { ...baseOptions, html: options.html };
  } else {
    throw new Error('sendEmail requires one of: template, react, html');
  }

  if (options.preventThreading) {
    emailOptions.headers = { 'X-Entity-Ref-ID': randomUUID() };
  }

  const startTime = performance.now();
  let response;

  try {
    response = await getResendClient().emails.send(emailOptions);
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error('Resend API threw an unhandled exception', {
      event: 'mailer.resend.error',
      durationMs,
      error: errorMessage,
      subject: options.subject,
    });

    Sentry.captureException(error, {
      tags: { service: 'resend' },
      extra: { subject: options.subject, durationMs },
    });

    throw error;
  }

  const durationMs = Math.round(performance.now() - startTime);
  const { data, error } = response;

  if (error) {
    logger.error(`Resend API error: ${error.message}`, {
      event: 'mailer.resend.failed',
      durationMs,
      error: error.message,
      name: error.name,
      subject: options.subject,
    });

    Sentry.captureException(new Error(`Resend API Error: ${error.message}`), {
      tags: { service: 'resend', errorName: error.name },
      extra: { subject: options.subject, durationMs },
    });

    throw new Error(error.message);
  }

  logger.info('Email sent via Resend', {
    event: 'mailer.resend.success',
    durationMs,
    emailId: data?.id,
    subject: options.subject,
    recipientsCount: recipients.length,
  });

  return { id: data?.id ?? 'unknown' };
}
