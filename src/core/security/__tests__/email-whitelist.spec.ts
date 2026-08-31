import { vi } from 'vitest';

const WHITELIST = 'tester1@example.com,tester2@example.com;TESTER3@EXAMPLE.COM';

async function loadWithEmaillist(value: string | undefined) {
  vi.resetModules();
  if (value === undefined) {
    vi.stubEnv('EMAIL_WHITELIST', '');
    delete process.env.EMAIL_WHITELIST;
  } else {
    vi.stubEnv('EMAIL_WHITELIST', value);
  }
  const result = await import('../email-whitelist');
  return result.isAuthorizedEmail;
}

describe('isAuthorizedEmail', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ['tester1@example.com', true, 'in the whitelist'],
    ['TESTER1@EXAMPLE.COM', true, 'different casing'],
    ['  tester1@example.com  ', true, 'surrounding whitespace'],
    ['random@example.com', false, 'not in the whitelist'],
    ['tester2@example.com', true, 'semicolon-separated'],
    ['tester3@example.com', true, 'normalized to lowercase'],
  ])('returns %s for email %s', async (email, expected) => {
    const check = await loadWithEmaillist(WHITELIST);

    expect(check(email)).toBe(expected);
  });

  it('deduplicates entries', async () => {
    const check = await loadWithEmaillist('a@x.com,a@x.com,b@x.com');

    expect(check('a@x.com')).toBe(true);
    expect(check('b@x.com')).toBe(true);
    expect(check('c@x.com')).toBe(false);
  });

  it('filters out invalid email entries from whitelist', async () => {
    const check = await loadWithEmaillist(
      'valid@example.com,not-an-email,also-bad@',
    );

    expect(check('valid@example.com')).toBe(true);
    expect(check('not-an-email')).toBe(false);
    expect(check('also-bad@')).toBe(false);
  });

  it('returns true for all emails when whitelist is empty', async () => {
    const check = await loadWithEmaillist('');

    expect(check('anyone@example.com')).toBe(true);
  });

  it('returns true for all emails when EMAIL_WHITELIST is undefined', async () => {
    const check = await loadWithEmaillist(undefined);

    expect(check('anyone@example.com')).toBe(true);
  });

  it('trims whitespace around whitelist entries', async () => {
    const check = await loadWithEmaillist(
      '  tester1@example.com  ,tester2@example.com',
    );

    expect(check('tester1@example.com')).toBe(true);
    expect(check('tester2@example.com')).toBe(true);
    expect(check('random@example.com')).toBe(false);
  });

  it('filters out empty entries from split', async () => {
    const check = await loadWithEmaillist('a@x.com,, ,b@x.com');

    expect(check('a@x.com')).toBe(true);
    expect(check('b@x.com')).toBe(true);
    expect(check('c@x.com')).toBe(false);
  });
});
