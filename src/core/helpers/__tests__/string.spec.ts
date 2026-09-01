import { toSentence } from '@/core/helpers/string';

describe('toSentence', () => {
  it.each([
    { name: 'empty string', input: '', expected: '' },
    { name: 'whitespace-only', input: ' '.repeat(3), expected: '' },
    { name: 'lowercase', input: 'hello world', expected: 'Hello world.' },
    {
      name: 'already capitalized',
      input: 'Hello there',
      expected: 'Hello there.',
    },
    {
      name: 'fully uppercase (only first char touched)',
      input: 'HELLO WORLD',
      expected: 'HELLO WORLD.',
    },
    {
      name: 'trailing period preserved',
      input: 'Already done.',
      expected: 'Already done.',
    },
    {
      name: 'trailing exclamation preserved',
      input: 'Watch out!',
      expected: 'Watch out!',
    },
    {
      name: 'trailing question mark preserved',
      input: 'Are you sure?',
      expected: 'Are you sure?',
    },
    { name: 'padded input trimmed', input: '  padded  ', expected: 'Padded.' },
    { name: 'single character', input: 'x', expected: 'X.' },
    {
      name: 'punctuation only in the middle',
      input: 'hello.world',
      expected: 'Hello.world.',
    },
  ])('returns $expected for $name', ({ input, expected }) => {
    expect(toSentence(input)).toBe(expected);
  });

  it('throws TypeError for null input', () => {
    expect(() => toSentence(null as unknown as string)).toThrow(TypeError);
  });

  it('throws TypeError for undefined input', () => {
    expect(() => toSentence(undefined as unknown as string)).toThrow(TypeError);
  });
});
