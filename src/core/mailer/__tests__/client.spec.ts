import { vi } from 'vitest';

import { env } from '@/core/env';

import { getResendClient } from '../client';

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

describe('getResendClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    calls.length = 0;
  });

  it('creates a Resend client with the API key from env', () => {
    getResendClient();

    expect(calls[0]).toBe(env.RESEND_API_KEY);
  });

  it('returns an instance with emails.send', () => {
    const client = getResendClient();

    expect(client).toBe(resendInstance);
    expect(client.emails.send).toBeDefined();
  });

  it('creates a new instance on each call', () => {
    getResendClient();
    const firstCount = calls.length;

    getResendClient();

    expect(calls.length).toBeGreaterThan(firstCount);
  });
});
