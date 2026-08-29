import { toSentence } from '@/core/helpers/string';

describe('toSentence', () => {
  it('returns empty string for empty input', () => {
    expect(toSentence('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(toSentence(' '.repeat(3))).toBe('');
  });

  it('capitalizes the first letter', () => {
    expect(toSentence('hello world')).toBe('Hello world.');
  });

  it('adds a trailing period when missing', () => {
    expect(toSentence('something failed')).toBe('Something failed.');
  });

  it('preserves existing trailing period', () => {
    expect(toSentence('Already done.')).toBe('Already done.');
  });

  it('preserves existing trailing exclamation mark', () => {
    expect(toSentence('Watch out!')).toBe('Watch out!');
  });

  it('preserves existing trailing question mark', () => {
    expect(toSentence('Are you sure?')).toBe('Are you sure?');
  });

  it('does not alter already-capitalized text', () => {
    expect(toSentence('Hello there')).toBe('Hello there.');
  });

  it('trims surrounding whitespace before formatting', () => {
    expect(toSentence('  padded  ')).toBe('Padded.');
  });

  it('handles single character without punctuation', () => {
    expect(toSentence('x')).toBe('X.');
  });
});
