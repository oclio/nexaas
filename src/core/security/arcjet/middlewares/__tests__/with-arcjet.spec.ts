import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

const protectMock = vi.fn();

vi.mock('@arcjet/next', () => ({
  default: vi.fn(() => ({ protect: protectMock })),
  detectBot: vi.fn(() => ({ type: 'detectBot' })),
  shield: vi.fn(() => ({ type: 'shield' })),
  tokenBucket: vi.fn(() => ({ type: 'tokenBucket' })),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock('@/core/observability/axiom/server', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/core/config/env', () => ({
  env: {
    ARCJET_KEY: 'test-arcjet-key',
    ARCJET_ENV: 'development',
  },
}));

const { withArcjet } = await import('../with-arcjet');
const arcjetModule = await import('@arcjet/next');
const arcjetDefault = arcjetModule.default as ReturnType<typeof vi.fn>;
const { captureException } = await import('@sentry/nextjs');
const { captureMessage } = await import('@sentry/nextjs');
const { logger } = await import('@/core/observability/axiom/server');

function mockRequest(): NextRequest {
  return {
    headers: new Headers(),
    url: 'http://localhost:3000/test',
    method: 'GET',
    nextUrl: { pathname: '/test' },
  } as unknown as NextRequest;
}

function mockEvent(): NextFetchEvent {
  return {
    waitUntil: vi.fn(),
  } as unknown as NextFetchEvent;
}

function nextMock() {
  return vi.fn().mockResolvedValue(NextResponse.next());
}

describe('withArcjet', () => {
  afterEach(() => {
    protectMock.mockReset();
    protectMock.mockResolvedValue({ isDenied: () => false });
  });

  it('calls next when arcjet is disabled (no key)', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { ARCJET_KEY: undefined, ARCJET_ENV: 'development' },
    }));
    const { withArcjet: disabledArcjet } = await import('../with-arcjet');
    const next = nextMock();

    await disabledArcjet(mockRequest(), mockEvent(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(protectMock).not.toHaveBeenCalled();
  });

  it('calls next when decision is allowed', async () => {
    protectMock.mockResolvedValue({ isDenied: () => false });
    const next = nextMock();

    await withArcjet(mockRequest(), mockEvent(), next);

    expect(protectMock).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
  });

  it('returns 403 with bot message when bot is detected', async () => {
    protectMock.mockResolvedValue({
      isDenied: () => true,
      reason: { isBot: () => true, isRateLimit: () => false },
    });
    const next = nextMock();
    const event = mockEvent();

    const response = await withArcjet(mockRequest(), event, next);

    expect(response.status).toBe(403);
    expect(await response.text()).toBe('Automated clients are not permitted');
    expect(next).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        event: 'security.arcjet.denied',
        reason: 'bot',
        statusCode: 403,
      }),
    );
    expect(captureMessage).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        level: 'warning',
        tags: expect.objectContaining({ reason: 'bot' }),
      }),
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
    expect(logger.warn).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        event: 'security.arcjet.denied',
        reason: 'rate_limit',
        statusCode: 429,
      }),
    );
    expect(captureMessage).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        tags: expect.objectContaining({ reason: 'rate_limit' }),
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
    expect(logger.warn).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        event: 'security.arcjet.denied',
        reason: 'other',
        statusCode: 403,
      }),
    );
    expect(captureMessage).toHaveBeenCalledWith(
      'Request denied by Arcjet',
      expect.objectContaining({
        tags: expect.objectContaining({ reason: 'other' }),
      }),
    );
  });

  it('fails open and calls next when protect throws', async () => {
    protectMock.mockRejectedValue(new Error('Arcjet API down'));
    const next = nextMock();
    const event = mockEvent();

    await withArcjet(mockRequest(), event, next);

    expect(next).toHaveBeenCalledOnce();
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { service: 'arcjet' },
    });
    expect(event.waitUntil).toHaveBeenCalled();
  });

  it('initializes arcjet with correct configuration', () => {
    expect(arcjetDefault).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'test-arcjet-key',
        characteristics: ['ip.src'],
      }),
    );
  });

  it('passes shield, detectBot, and tokenBucket rules', async () => {
    const { shield, detectBot, tokenBucket } = await import('@arcjet/next');
    const shieldMock = shield as unknown as () => unknown;
    const detectBotMock = detectBot as unknown as () => unknown;
    const tokenBucketMock = tokenBucket as unknown as () => unknown;
    expect(arcjetDefault).toHaveBeenCalledWith(
      expect.objectContaining({
        rules: [shieldMock(), detectBotMock(), tokenBucketMock()],
      }),
    );
  });

  it('uses DRY_RUN mode in development', async () => {
    const { shield, detectBot, tokenBucket } = await import('@arcjet/next');
    expect(shield).toHaveBeenCalledWith({ mode: 'DRY_RUN' });
    expect(detectBot).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'DRY_RUN' }),
    );
    expect(tokenBucket).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'DRY_RUN' }),
    );
  });

  it('uses LIVE mode in production', async () => {
    vi.resetModules();
    vi.doMock('@/core/config/env', () => ({
      env: { ARCJET_KEY: 'test-arcjet-key', ARCJET_ENV: 'production' },
    }));

    await import('../with-arcjet');
    const { shield: shieldProduction } = await import('@arcjet/next');

    expect(shieldProduction).toHaveBeenCalledWith({ mode: 'LIVE' });
  });
});
