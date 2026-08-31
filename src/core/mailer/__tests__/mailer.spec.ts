import { vi } from 'vitest';

const { sendMock, resendClient } = vi.hoisted(() => {
  const sendMock = vi.fn();
  return { sendMock, resendClient: { emails: { send: sendMock } } };
});

vi.mock('../client', () => ({ getResendClient: () => resendClient }));

const { renderTemplateMock } = vi.hoisted(() => ({
  renderTemplateMock: vi.fn(),
}));

vi.mock('../render', () => ({ renderTemplate: renderTemplateMock }));

const { filterRecipientsMock } = vi.hoisted(() => ({
  filterRecipientsMock: vi.fn(),
}));

vi.mock('../whitelist', () => ({ filterRecipients: filterRecipientsMock }));

const { sendEmail } = await import('../mailer');
const { axiomLoggerMock, sentryMocks } =
  await import('@/../tests/unit/mocks/observability');

describe('sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    filterRecipientsMock.mockReturnValue(['user@example.com']);
    renderTemplateMock.mockResolvedValue({ type: 'div' });
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(150);
  });

  describe('content selection', () => {
    it('sends an html email and returns the id', async () => {
      sendMock.mockResolvedValue({ data: { id: 'msg-123' }, error: null });

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Welcome',
        html: '<p>Hello</p>',
      });

      expect(result).toEqual({ id: 'msg-123' });
      expect(sendMock).toHaveBeenCalledWith({
        from: 'nexaas <noreply@nexaas.dev>',
        to: ['user@example.com'],
        subject: 'Welcome',
        html: '<p>Hello</p>',
      });
    });

    it('sends a react email element', async () => {
      sendMock.mockResolvedValue({ data: { id: 'msg-456' }, error: null });
      const reactElement = { type: 'div' } as never;

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'OTP',
        react: reactElement,
      });

      expect(result).toEqual({ id: 'msg-456' });
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({ react: reactElement }),
      );
    });

    it('renders and sends a template email', async () => {
      sendMock.mockResolvedValue({ data: { id: 'msg-789' }, error: null });

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Welcome',
        template: 'welcome',
        props: { name: 'Alice' },
      });

      expect(result).toEqual({ id: 'msg-789' });
      expect(renderTemplateMock).toHaveBeenCalledWith('welcome', {
        name: 'Alice',
      });
      expect(sendMock).toHaveBeenCalledWith(
        expect.objectContaining({ react: { type: 'div' } }),
      );
    });

    it('throws when no content is provided', async () => {
      await expect(
        sendEmail({ to: 'user@example.com', subject: 'Empty' }),
      ).rejects.toThrow('sendEmail requires one of: template, react, html');
    });
  });

  describe('preventThreading', () => {
    it('adds X-Entity-Ref-ID header when enabled', async () => {
      sendMock.mockResolvedValue({ data: { id: 'msg-t' }, error: null });

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Hi</p>',
        preventThreading: true,
      });

      const call = sendMock.mock.calls[0][0];
      expect(call.headers).toBeDefined();
      expect(call.headers['X-Entity-Ref-ID']).toEqual(expect.any(String));
    });

    it('does not add headers when preventThreading is false', async () => {
      sendMock.mockResolvedValue({ data: { id: 'msg-t' }, error: null });

      await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Hi</p>',
      });

      const call = sendMock.mock.calls[0][0];
      expect(call.headers).toBeUndefined();
    });
  });

  describe('recipient filtering', () => {
    it('returns skipped when all recipients are unauthorized', async () => {
      filterRecipientsMock.mockReturnValue([]);

      const result = await sendEmail({
        to: 'blocked@example.com',
        subject: 'Test',
        html: '<p>Hi</p>',
      });

      expect(result).toEqual({ id: 'skipped' });
      expect(sendMock).not.toHaveBeenCalled();
      expect(axiomLoggerMock.info).toHaveBeenCalledWith(
        'No authorized recipients, skipping send',
        expect.objectContaining({ event: 'mailer.send.skipped' }),
      );
    });
  });

  describe('error handling', () => {
    it('throws and logs when Resend API throws an exception', async () => {
      const networkError = new Error('Network timeout');
      sendMock.mockRejectedValue(networkError);

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          html: '<p>Hi</p>',
        }),
      ).rejects.toThrow('Network timeout');

      expect(axiomLoggerMock.error).toHaveBeenCalledWith(
        'Resend API threw an unhandled exception',
        expect.objectContaining({
          event: 'mailer.resend.error',
          error: 'Network timeout',
          durationMs: 50,
        }),
      );
      expect(sentryMocks.captureException).toHaveBeenCalledWith(networkError, {
        tags: { service: 'resend' },
        extra: expect.objectContaining({ subject: 'Test' }),
      });
    });

    it('handles non-Error thrown values', async () => {
      sendMock.mockRejectedValue('string error');

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          html: '<p>Hi</p>',
        }),
      ).rejects.toThrow('string error');

      expect(axiomLoggerMock.error).toHaveBeenCalledWith(
        'Resend API threw an unhandled exception',
        expect.objectContaining({
          event: 'mailer.resend.error',
          error: 'string error',
          durationMs: 50,
        }),
      );
    });

    it('throws and logs when Resend API returns an error', async () => {
      sendMock.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key', name: 'invalid_api_key' },
      });

      await expect(
        sendEmail({
          to: 'user@example.com',
          subject: 'Test',
          html: '<p>Hi</p>',
        }),
      ).rejects.toThrow('Invalid API key');

      expect(axiomLoggerMock.error).toHaveBeenCalledWith(
        'Resend API error: Invalid API key',
        expect.objectContaining({
          event: 'mailer.resend.failed',
          error: 'Invalid API key',
          name: 'invalid_api_key',
          durationMs: 50,
        }),
      );
      expect(sentryMocks.captureException).toHaveBeenCalledWith(
        new Error('Resend API Error: Invalid API key'),
        {
          tags: { service: 'resend', errorName: 'invalid_api_key' },
          extra: expect.objectContaining({ subject: 'Test' }),
        },
      );
    });
  });

  describe('success logging', () => {
    it('logs success with email id and recipient count', async () => {
      filterRecipientsMock.mockReturnValue(['a@example.com', 'b@example.com']);
      sendMock.mockResolvedValue({ data: { id: 'msg-ok' }, error: null });

      await sendEmail({
        to: ['a@example.com', 'b@example.com'],
        subject: 'Test',
        html: '<p>Hi</p>',
      });

      expect(axiomLoggerMock.info).toHaveBeenCalledWith(
        'Email sent via Resend',
        expect.objectContaining({
          event: 'mailer.resend.success',
          emailId: 'msg-ok',
          recipientsCount: 2,
          durationMs: 50,
        }),
      );
    });

    it('returns unknown id when data.id is missing', async () => {
      sendMock.mockResolvedValue({ data: {}, error: null });

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Hi</p>',
      });

      expect(result).toEqual({ id: 'unknown' });
    });

    it('handles null data without throwing', async () => {
      sendMock.mockResolvedValue({ data: null, error: null });

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Hi</p>',
      });

      expect(result).toEqual({ id: 'unknown' });
      expect(axiomLoggerMock.info).toHaveBeenCalledWith(
        'Email sent via Resend',
        expect.objectContaining({ emailId: undefined }),
      );
    });
  });
});
