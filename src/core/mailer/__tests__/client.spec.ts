import { vi } from 'vitest';

const { resendInstance, calls } = vi.hoisted(() => ({
  resendInstance: { emails: { send: vi.fn() } },
  calls: [] as string[],
}));

vi.mock('resend', () => ({
  Resend: class {
    constructor(key: string) {
      calls.push(key);
      return resendInstance;
    }
  },
}));

const { getResendClient } = await import('../client');

describe('getResendClient', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('creates a Resend client with the API key from env', () => {
    getResendClient();

    expect(calls).toEqual(['re_test_key_1234567890']);
  });

  it('returns an instance with emails.send', () => {
    const client = getResendClient();

    expect(client).toBe(resendInstance);
    expect(client.emails.send).toBeDefined();
  });

  it('creates a new instance on each call', () => {
    getResendClient();
    getResendClient();

    expect(calls).toHaveLength(2);
  });
});
