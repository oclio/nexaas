import { vi } from 'vitest';

import { formatErrorMessage, getErrorMessage } from '@/core/errors/helpers';

const toSentenceMock = vi.hoisted(() => vi.fn((s: string) => `SENTENCE(${s})`));
vi.mock('@/core/helpers', () => ({ toSentence: toSentenceMock }));

describe('getErrorMessage', () => {
  it.each([
    { name: 'Error instance', input: new Error('boom'), expected: 'boom' },
    {
      name: 'Error subclass',
      input: (() => {
        class CustomError extends Error {
          constructor() {
            super('custom failure');
            this.name = 'CustomError';
          }
        }
        return new CustomError();
      })(),
      expected: 'custom failure',
    },
    {
      name: 'object with string message',
      input: { message: 'object error' },
      expected: 'object error',
    },
    {
      name: 'object with empty string message',
      input: { message: '' },
      expected: '',
    },
    {
      name: 'object with non-string message',
      input: { message: 42 },
      expected: '{"message":42}',
    },
    {
      name: 'object with null message',
      input: { message: null },
      expected: '{"message":null}',
    },
    { name: 'plain string', input: 'plain string', expected: 'plain string' },
    { name: 'null', input: null, expected: 'Unknown error' },
    { name: 'undefined', input: undefined, expected: 'Unknown error' },
    { name: 'plain object', input: { code: 500 }, expected: '{"code":500}' },
    { name: 'array', input: [1, 2, 3], expected: '[1,2,3]' },
    { name: 'number', input: 42, expected: '42' },
    { name: 'boolean', input: true, expected: 'true' },
  ])('returns $expected for $name', ({ input, expected }) => {
    expect(getErrorMessage(input)).toBe(expected);
  });

  it('returns Unknown error for circular objects', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(getErrorMessage(circular)).toBe('Unknown error');
  });
});

describe('formatErrorMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Unknown error. for empty string', () => {
    expect(formatErrorMessage('')).toBe('Unknown error.');
    expect(toSentenceMock).not.toHaveBeenCalled();
  });

  it('returns Unknown error. for whitespace-only string', () => {
    expect(formatErrorMessage(' '.repeat(3))).toBe('Unknown error.');
    expect(toSentenceMock).not.toHaveBeenCalled();
  });

  it('returns Unknown error. when only prefix remains after strip', () => {
    expect(formatErrorMessage('error:')).toBe('Unknown error.');
    expect(toSentenceMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'strips leading "error:" prefix',
      input: 'error: something failed',
      expectedInput: 'something failed',
    },
    {
      name: 'strips "error:" prefix after leading whitespace',
      input: '  error: something failed',
      expectedInput: 'something failed',
    },
    {
      name: 'strips multiple leading "error:" prefixes',
      input: 'error: error: nested',
      expectedInput: 'nested',
    },
    {
      name: 'does not strip "error:" when not at the start',
      input: 'something error: failed',
      expectedInput: 'something error: failed',
    },
  ])('$name', ({ input, expectedInput }) => {
    formatErrorMessage(input);

    expect(toSentenceMock).toHaveBeenCalledWith(expectedInput);
  });

  it('returns the toSentence output for normal strings', () => {
    toSentenceMock.mockReturnValueOnce('Formatted.');

    expect(formatErrorMessage('raw message')).toBe('Formatted.');
    expect(toSentenceMock).toHaveBeenCalledWith('raw message');
  });

  it.each([
    { name: 'JSON object', input: '{"code":500,"message":"fail"}' },
    { name: 'JSON array', input: '[1,2,3]' },
    { name: 'JSON-like invalid string', input: '{not json' },
  ])('returns $name as-is without calling toSentence', ({ input }) => {
    expect(formatErrorMessage(input)).toBe(input);
    expect(toSentenceMock).not.toHaveBeenCalled();
  });
});
