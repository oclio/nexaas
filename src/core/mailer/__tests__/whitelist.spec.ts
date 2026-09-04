import { vi } from 'vitest';

import { axiomLoggerMock } from '@/tests/unit/mocks/observability';

import { filterRecipients } from '../whitelist';

const { isAuthorizedEmailMock } = vi.hoisted(() => ({
  isAuthorizedEmailMock: vi.fn(),
}));

vi.mock('@/core/security/email-whitelist', () => ({
  isAuthorizedEmail: isAuthorizedEmailMock,
}));

describe('filterRecipients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all recipients when all are authorized', () => {
    const recipients = ['a@example.com', 'b@example.com'];
    isAuthorizedEmailMock.mockReturnValue(true);

    const result = filterRecipients(recipients);

    expect(result).toHaveLength(recipients.length);
    expect(axiomLoggerMock.warn).not.toHaveBeenCalled();
  });

  it.each(['a@example.com', 'b@example.com'])(
    'includes $recipient in the result when authorized',
    (recipient) => {
      isAuthorizedEmailMock.mockReturnValue(true);

      const result = filterRecipients([recipient]);

      expect(result).toContain(recipient);
    },
  );

  it('wraps a single string into an array', () => {
    isAuthorizedEmailMock.mockReturnValue(true);

    const result = filterRecipients('user@example.com');

    expect(result).toHaveLength(1);
    expect(result).toContain('user@example.com');
  });

  it('filters out unauthorized recipients and logs a warning', () => {
    const allowed = 'allowed@example.com';
    const blocked = 'blocked@example.com';
    isAuthorizedEmailMock.mockImplementation((email: string) =>
      email.includes('allowed'),
    );

    const result = filterRecipients([allowed, blocked]);

    expect(result).toHaveLength(1);
    expect(result).toContain(allowed);
    expect(result).not.toContain(blocked);
    expect(axiomLoggerMock.warn).toHaveBeenCalledWith(
      'Blocked unauthorized email recipients',
      { event: 'mailer.recipients.blocked', blocked: 1, authorized: 1 },
    );
  });

  it('returns empty array when all recipients are blocked', () => {
    isAuthorizedEmailMock.mockReturnValue(false);

    const result = filterRecipients(['a@blocked.com', 'b@blocked.com']);

    expect(result).toHaveLength(0);
    expect(axiomLoggerMock.warn).toHaveBeenCalledWith(
      'Blocked unauthorized email recipients',
      { event: 'mailer.recipients.blocked', blocked: 2, authorized: 0 },
    );
  });
});
