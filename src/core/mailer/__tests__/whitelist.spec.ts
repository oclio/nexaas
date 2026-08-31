import { vi } from 'vitest';

const { isAuthorizedEmailMock } = vi.hoisted(() => ({
  isAuthorizedEmailMock: vi.fn(),
}));

vi.mock('@/core/security/email-whitelist', () => ({
  isAuthorizedEmail: isAuthorizedEmailMock,
}));

const { filterRecipients } = await import('../whitelist');
const { axiomLoggerMock } = await import('@/tests/unit/mocks/observability');

describe('filterRecipients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all recipients when all are authorized', () => {
    isAuthorizedEmailMock.mockReturnValue(true);

    const result = filterRecipients(['a@example.com', 'b@example.com']);

    expect(result).toEqual(['a@example.com', 'b@example.com']);
    expect(axiomLoggerMock.warn).not.toHaveBeenCalled();
  });

  it('wraps a single string into an array', () => {
    isAuthorizedEmailMock.mockReturnValue(true);

    const result = filterRecipients('user@example.com');

    expect(result).toEqual(['user@example.com']);
  });

  it('filters out unauthorized recipients and logs a warning', () => {
    isAuthorizedEmailMock.mockImplementation(
      (email: string) => email === 'allowed@example.com',
    );

    const result = filterRecipients([
      'allowed@example.com',
      'blocked@example.com',
    ]);

    expect(result).toEqual(['allowed@example.com']);
    expect(axiomLoggerMock.warn).toHaveBeenCalledWith(
      'Blocked unauthorized email recipients',
      { event: 'mailer.recipients.blocked', blocked: 1, authorized: 1 },
    );
  });

  it('returns empty array when all recipients are blocked', () => {
    isAuthorizedEmailMock.mockReturnValue(false);

    const result = filterRecipients(['a@blocked.com', 'b@blocked.com']);

    expect(result).toEqual([]);
    expect(axiomLoggerMock.warn).toHaveBeenCalledWith(
      'Blocked unauthorized email recipients',
      { event: 'mailer.recipients.blocked', blocked: 2, authorized: 0 },
    );
  });

  it('does not log when no recipients are blocked', () => {
    isAuthorizedEmailMock.mockReturnValue(true);

    filterRecipients(['a@example.com']);

    expect(axiomLoggerMock.warn).not.toHaveBeenCalled();
  });
});
