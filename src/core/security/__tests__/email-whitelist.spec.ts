import { vi } from 'vitest';

vi.mock('@/core/config/env', () => ({
  env: {
    EMAIL_WHITELIST:
      'tester1@example.com,tester2@example.com;TESTER3@EXAMPLE.COM',
  },
}));

const { isAuthorizedEmail } = await import('../email-whitelist');

describe('isAuthorizedEmail', () => {
  it('returns true when email is in the whitelist', () => {
    expect(isAuthorizedEmail('tester1@example.com')).toBe(true);
  });

  it('returns true when email matches with different casing', () => {
    expect(isAuthorizedEmail('TESTER1@EXAMPLE.COM')).toBe(true);
  });

  it('returns true when email has surrounding whitespace', () => {
    expect(isAuthorizedEmail('  tester1@example.com  ')).toBe(true);
  });

  it('returns false when email is not in the whitelist', () => {
    expect(isAuthorizedEmail('random@example.com')).toBe(false);
  });

  it('handles semicolon-separated entries', () => {
    expect(isAuthorizedEmail('tester2@example.com')).toBe(true);
  });

  it('normalizes entries to lowercase', () => {
    expect(isAuthorizedEmail('tester3@example.com')).toBe(true);
  });

  it('deduplicates entries', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { EMAIL_WHITELIST: 'a@x.com,a@x.com,b@x.com' },
    }));
    const { isAuthorizedEmail: check } = await import('../email-whitelist');

    expect(check('a@x.com')).toBe(true);
    expect(check('b@x.com')).toBe(true);
    expect(check('c@x.com')).toBe(false);
  });

  it('filters out invalid email entries from whitelist', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { EMAIL_WHITELIST: 'valid@example.com,not-an-email,also-bad@' },
    }));
    const { isAuthorizedEmail: check } = await import('../email-whitelist');

    expect(check('valid@example.com')).toBe(true);
    expect(check('not-an-email')).toBe(false);
    expect(check('also-bad@')).toBe(false);
  });

  it('returns true for all emails when whitelist is empty', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { EMAIL_WHITELIST: '' },
    }));
    const { isAuthorizedEmail: check } = await import('../email-whitelist');

    expect(check('anyone@example.com')).toBe(true);
  });

  it('returns true for all emails when EMAIL_WHITELIST is undefined', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { EMAIL_WHITELIST: undefined },
    }));
    const { isAuthorizedEmail: check } = await import('../email-whitelist');

    expect(check('anyone@example.com')).toBe(true);
  });

  it('filters out empty entries from split', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { EMAIL_WHITELIST: 'a@x.com,, ,b@x.com' },
    }));
    const { isAuthorizedEmail: check } = await import('../email-whitelist');

    expect(check('a@x.com')).toBe(true);
    expect(check('b@x.com')).toBe(true);
    expect(check('c@x.com')).toBe(false);
  });
});
