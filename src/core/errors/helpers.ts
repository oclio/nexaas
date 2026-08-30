import { toSentence } from '@/core/helpers';

export function getErrorMessage(error: unknown): string {
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
  const cleaned = message.trim().replace(/^(error:\s*)+/i, '');
  if (!cleaned) return 'Unknown error.';

  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    return cleaned;
  }

  return toSentence(cleaned);
}
