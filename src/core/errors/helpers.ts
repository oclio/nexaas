import { toSentence } from '@/core/helpers';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error === null || error === undefined) {
    return 'Unknown error';
  }

  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

export function formatErrorMessage(message: string): string {
  let cleaned = message.trim();
  if (!cleaned) return 'Unknown error.';

  cleaned = cleaned.replace(/^(error:\s*)+/i, '').trim();
  if (!cleaned) return 'Unknown error.';

  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    return cleaned;
  }

  return toSentence(cleaned);
}
