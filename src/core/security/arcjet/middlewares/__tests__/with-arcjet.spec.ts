import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';
import { axiomLoggerMock, sentryMocks } from '@/tests/unit/mocks/observability';

const protectMock = vi.fn();

vi.mock('@arcjet/next', () => ({
  default: vi.fn(() => ({ protect: protectMock })),
  detectBot: vi.fn(() => ({ type: 'detectBot' })),
  shield: vi.fn(() => ({ type: 'shield' })),
  tokenBucket: vi.fn(() => ({ type: 'tokenBucket' })),
}));

vi.stubEnv('ARCJET_KEY', 'test-arcjet-key');
vi.stubEnv('ARCJET_ENV', 'development');

const { withArcjet } = await import('../with-arcjet');

const mockRequest = (): NextRequest => mockNextRequest();
const mockEvent = mockNextFetchEvent;

function nextMock() {
  return vi.fn().mockResolvedValue(NextResponse.next());
}

function mockArcjetModule() {
  const shieldMock = vi.fn(() => ({ type: 'shield' }));
  const detectBotMock = vi.fn(() => ({ type: 'detectBot' }));
  const tokenBucketMock = vi.fn(() => ({ type: 'tokenBucket' }));
  const arcjetInit = vi.fn(() => ({ protect: protectMock }));
  vi.doMock('@arcjet/next', () => ({
    default: arcjetInit,
    detectBot: detectBotMock,
    shield: shieldMock,
    tokenBucket: tokenBucketMock,
  }));
  return { arcjetInit, shieldMock, detectBotMock, tokenBucketMock };
}

describe('withArcjet', () => {
  afterEach(() => {
    protectMock.mockReset();
    protectMock.mockResolvedValue({ isDenied: () => false });
    sentryMocks.captureException.mockClear();
    sentryMocks.captureMessage.mockClear();
    axiomLoggerMock.warn.mockClear();
    axiomLoggerMock.error.mockClear();
    axiomLoggerMock.flush.mockClear();
  });

  it('calls next when arcjet is disabled (no key)', async () => {
    process.env.ARCJET_KEY = '';
    vi.resetModules();
    mockArcjetModule();
    const { withArcjet: disabledArcjet } = await import('../with-arcjet');
    const next = nextMock();

    const result = await disabledArcjet(mockRequest(), mockEvent(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(result).toBe(await next.mock.results[0].value);
    expect(protectMock).not.toHaveBeenCalled();
    expect(axiomLoggerMock.error).not.toHaveBeenCalled();
    expect(sentryMocks.captureException).not.toHaveBeenCalled();
    process.env.ARCJET_KEY = 'test-arcjet-key';
  });

  it('calls next when decision is allowed', async () => {
    const isDeniedMock = vi.fn(() => false);
    protectMock.mockResolvedValue({ isDenied: isDeniedMock });
    const next = nextMock();

    await withArcjet(mockRequest(), mockEvent(), next);

    expect(protectMock).toHaveBeenCalledWith(expect.anything(), {
      requested: 1,
    });
    expect(isDeniedMock).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 403 with bot message when bot is detected', async () => {
    protectMock.mockResolvedValue({
      isDenied: () => true,
      reason: { isBot: () => true, isRateLimit: () => false },
    });
    const next = nextMock();
    const event = mockEvent();
    const req = mockRequest();
    req.headers.set('x-forwarded-for', '198.51.100.1');

    const response = await withArcjet(req, event, next);

    expect(response.status).toBe(403);
    expect(await response.text()).toBe('Automated clients are not permitted');
    expect(next).not.toHaveBeenCalled();
    expect(axiomLoggerMock.warn).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        event: 'security.arcjet.denied',
        reason: 'bot',
        ip: '198.51.100.1',
        statusCode: 403,
      }),
    );
    expect(sentryMocks.captureMessage).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      {
        level: 'warning',
        tags: { service: 'arcjet', reason: 'bot' },
        extra: { ip: '198.51.100.1', method: 'GET', path: '/test' },
      },
    );
    expect(event.waitUntil).toHaveBeenCalled();
  });

  it('returns 429 when rate limit is exceeded', async () => {
    protectMock.mockResolvedValue({
      isDenied: () => true,
      reason: { isBot: () => false, isRateLimit: () => true },
    });
    const next = nextMock();
    const event = mockEvent();

    const response = await withArcjet(mockRequest(), event, next);

    expect(response.status).toBe(429);
    expect(await response.text()).toBe('Rate limit exceeded');
    expect(next).not.toHaveBeenCalled();
    expect(axiomLoggerMock.warn).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        event: 'security.arcjet.denied',
        reason: 'rate_limit',
        ip: 'unknown',
        statusCode: 429,
      }),
    );
    expect(sentryMocks.captureMessage).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        tags: { service: 'arcjet', reason: 'rate_limit' },
      }),
    );
  });

  it('returns 403 forbidden for other denial reasons', async () => {
    protectMock.mockResolvedValue({
      isDenied: () => true,
      reason: { isBot: () => false, isRateLimit: () => false },
    });
    const next = nextMock();
    const event = mockEvent();

    const response = await withArcjet(mockRequest(), event, next);

    expect(response.status).toBe(403);
    expect(await response.text()).toBe('Forbidden');
    expect(next).not.toHaveBeenCalled();
    expect(axiomLoggerMock.warn).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        event: 'security.arcjet.denied',
        reason: 'other',
        ip: 'unknown',
        statusCode: 403,
      }),
    );
    expect(sentryMocks.captureMessage).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        tags: { service: 'arcjet', reason: 'other' },
      }),
    );
  });

  it('fails open and calls next when protect throws', async () => {
    const error = new Error('Arcjet API down');
    protectMock.mockRejectedValue(error);
    const next = nextMock();
    const event = mockEvent();

    await withArcjet(mockRequest(), event, next);

    expect(next).toHaveBeenCalledOnce();
    expect(axiomLoggerMock.error).toHaveBeenCalledWith(
      'Failed to evaluate request security with Arcjet',
      {
        event: 'security.arcjet.error',
        err: error,
      },
    );
    expect(sentryMocks.captureException).toHaveBeenCalledWith(error, {
      tags: { service: 'arcjet' },
    });
    expect(event.waitUntil).toHaveBeenCalled();
  });

  it('initializes arcjet with correct configuration', async () => {
    vi.resetModules();
    const { arcjetInit } = mockArcjetModule();

    await import('../with-arcjet');

    expect(arcjetInit).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'test-arcjet-key',
        characteristics: ['ip.src'],
      }),
    );
  });

  it('passes shield, detectBot, and tokenBucket rules', async () => {
    vi.resetModules();
    const { arcjetInit, shieldMock, detectBotMock, tokenBucketMock } =
      mockArcjetModule();

    await import('../with-arcjet');

    expect(arcjetInit).toHaveBeenCalledWith(
      expect.objectContaining({
        rules: [shieldMock(), detectBotMock(), tokenBucketMock()],
      }),
    );
  });

  it('uses DRY_RUN mode in development', async () => {
    vi.stubEnv('ARCJET_ENV', 'development');
    vi.resetModules();
    const { shieldMock, detectBotMock, tokenBucketMock } = mockArcjetModule();

    await import('../with-arcjet');

    expect(shieldMock).toHaveBeenCalledWith({ mode: 'DRY_RUN' });
    expect(detectBotMock).toHaveBeenCalledWith({
      mode: 'DRY_RUN',
      allow: ['GOOGLE_CRAWLER', 'BING_CRAWLER', 'CURL'],
    });
    expect(tokenBucketMock).toHaveBeenCalledWith({
      mode: 'DRY_RUN',
      refillRate: 300,
      interval: '1h',
      capacity: 100,
    });
  });

  it('uses LIVE mode in production', async () => {
    process.env.ARCJET_ENV = 'production';
    vi.resetModules();
    const { shieldMock, detectBotMock, tokenBucketMock } = mockArcjetModule();

    await import('../with-arcjet');

    expect(shieldMock).toHaveBeenCalledWith({ mode: 'LIVE' });
    expect(detectBotMock).toHaveBeenCalledWith({
      mode: 'LIVE',
      allow: ['GOOGLE_CRAWLER', 'BING_CRAWLER', 'CURL'],
    });
    expect(tokenBucketMock).toHaveBeenCalledWith({
      mode: 'LIVE',
      refillRate: 300,
      interval: '1h',
      capacity: 100,
    });
    process.env.ARCJET_ENV = 'development';
  });
});
