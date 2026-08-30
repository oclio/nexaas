import { cn } from '@/ui/helpers';

describe('cn', () => {
  it('returns empty string when called with no arguments', () => {
    expect(cn()).toBe('');
  });

  it.each([
    { inputs: [''], expected: '' },
    { inputs: ['foo'], expected: 'foo' },
    { inputs: ['foo', 'bar'], expected: 'foo bar' },
    { inputs: ['foo', undefined, 'bar'], expected: 'foo bar' },
    { inputs: ['foo', null, 'bar'], expected: 'foo bar' },
    { inputs: ['foo', false, 'bar'], expected: 'foo bar' },
    { inputs: [undefined, null, false, ''], expected: '' },
  ])(
    'joins truthy class values into a single string',
    ({ inputs, expected }) => {
      expect(cn(...inputs)).toBe(expected);
    },
  );

  it.each([
    { inputs: [['foo', 'bar']], expected: 'foo bar' },
    { inputs: ['foo', ['bar', 'baz']], expected: 'foo bar baz' },
    { inputs: [['foo', false, 'bar']], expected: 'foo bar' },
  ])('flattens nested arrays of class values', ({ inputs, expected }) => {
    expect(cn(...inputs)).toBe(expected);
  });

  it.each([
    { inputs: [{ foo: true, bar: false }], expected: 'foo' },
    { inputs: ['foo', { bar: true, baz: false }], expected: 'foo bar' },
    { inputs: [{ 'px-2': true, hidden: false }], expected: 'px-2' },
  ])(
    'keeps keys whose value is truthy from object inputs',
    ({ inputs, expected }) => {
      expect(cn(...inputs)).toBe(expected);
    },
  );

  it.each([
    { inputs: ['px-2', 'px-4'], expected: 'px-4' },
    { inputs: ['text-sm', 'text-lg'], expected: 'text-lg' },
    { inputs: ['p-2', 'px-4'], expected: 'p-2 px-4' },
    { inputs: ['flex', 'block'], expected: 'block' },
  ])(
    'deduplicates conflicting tailwind classes keeping the last one',
    ({ inputs, expected }) => {
      expect(cn(...inputs)).toBe(expected);
    },
  );

  it('keeps non-conflicting tailwind classes untouched', () => {
    expect(cn('px-2', 'py-4', 'text-center')).toBe('px-2 py-4 text-center');
  });

  it('merges conditional, conflicting and non-conflicting classes together', () => {
    expect(
      cn('px-2 py-2', { 'text-center': true, hidden: false }, [
        'px-4',
        'font-bold',
      ]),
    ).toBe('py-2 text-center px-4 font-bold');
  });
});
