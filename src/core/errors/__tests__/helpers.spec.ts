import { formatErrorMessage, getErrorMessage } from '@/core/errors/helpers';

describe('getErrorMessage', () => {
  it('returns message from Error instance', () => {
    expect(getErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('returns message from Error subclass', () => {
    class CustomError extends Error {
      constructor() {
        super('custom failure');
        this.name = 'CustomError';
      }
    }
    expect(getErrorMessage(new CustomError())).toBe('custom failure');
  });

  it('returns message from object with string message property', () => {
    expect(getErrorMessage({ message: 'object error' })).toBe('object error');
  });

  it('falls through when object has non-string message', () => {
    expect(getErrorMessage({ message: 42 })).toBe('{"message":42}');
  });

  it('returns the string directly', () => {
    expect(getErrorMessage('plain string')).toBe('plain string');
  });

  it('returns Unknown error for null', () => {
    expect(getErrorMessage(null)).toBe('Unknown error');
  });

  it('returns Unknown error for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('Unknown error');
  });

  it('JSON-stringifies plain objects', () => {
    expect(getErrorMessage({ code: 500 })).toBe('{"code":500}');
  });

  it('JSON-stringifies arrays', () => {
    expect(getErrorMessage([1, 2, 3])).toBe('[1,2,3]');
  });

  it('returns Unknown error for circular objects', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(getErrorMessage(circular)).toBe('Unknown error');
  });

  it('returns Unknown error for numbers', () => {
    expect(getErrorMessage(42)).toBe('42');
  });

  it('returns Unknown error for booleans', () => {
    expect(getErrorMessage(true)).toBe('true');
  });
});

describe('formatErrorMessage', () => {
  it('returns Unknown error. for empty string', () => {
    expect(formatErrorMessage('')).toBe('Unknown error.');
  });

  it('returns Unknown error. for whitespace-only string', () => {
    expect(formatErrorMessage(' '.repeat(3))).toBe('Unknown error.');
  });

  it('strips leading "error:" prefix', () => {
    expect(formatErrorMessage('error: something failed')).toBe(
      'Something failed.',
    );
  });

  it('strips multiple leading "error:" prefixes', () => {
    expect(formatErrorMessage('error: error: nested')).toBe('Nested.');
  });

  it('returns Unknown error. when only prefix remains after strip', () => {
    expect(formatErrorMessage('error:')).toBe('Unknown error.');
  });

  it('returns JSON objects as-is without sentence formatting', () => {
    const json = '{"code":500,"message":"fail"}';
    expect(formatErrorMessage(json)).toBe(json);
  });

  it('returns JSON arrays as-is without sentence formatting', () => {
    const json = '[1,2,3]';
    expect(formatErrorMessage(json)).toBe(json);
  });

  it('capitalizes and adds trailing period', () => {
    expect(formatErrorMessage('something went wrong')).toBe(
      'Something went wrong.',
    );
  });

  it('preserves existing trailing punctuation', () => {
    expect(formatErrorMessage('Already done!')).toBe('Already done!');
  });

  it('trims surrounding whitespace before formatting', () => {
    expect(formatErrorMessage('  padded message  ')).toBe('Padded message.');
  });
});
