import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';
import { axiomLoggerMock } from '@/tests/unit/mocks/observability';

import { withAxiom } from '../with-axiom';

const envReference = {
  AXIOM_TOKEN: undefined as string | undefined,
  AXIOM_DATASET: undefined as string | undefined,
};

vi.mock('@/core/env', () => ({
  get env() {
    return envReference;
  },
}));

const transformMiddlewareRequestMock = vi.fn();
vi.mock('@axiomhq/nextjs', () => ({
  transformMiddlewareRequest: (...arguments_: unknown[]) =>
    transformMiddlewareRequestMock(...arguments_),
}));

const mockRequest = (): NextRequest => mockNextRequest();
const mockEvent = mockNextFetchEvent;

describe('withAxiom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    envReference.AXIOM_TOKEN = undefined;
    envReference.AXIOM_DATASET = undefined;
  });

  it('skips when AXIOM_TOKEN is not set', async () => {
    envReference.AXIOM_DATASET = 'test-dataset';
    const next = vi.fn().mockResolvedValue(new Response('ok'));

    const result = await withAxiom(mockRequest(), mockEvent(), next);

    expect(await result.text()).toBe('ok');
    expect(axiomLoggerMock.info).not.toHaveBeenCalled();
  });

  it('skips when AXIOM_DATASET is not set', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    const next = vi.fn().mockResolvedValue(new Response('ok'));

    const result = await withAxiom(mockRequest(), mockEvent(), next);

    expect(await result.text()).toBe('ok');
    expect(axiomLoggerMock.info).not.toHaveBeenCalled();
  });

  it('sets x-trace-id header on request and response', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['request-log', {}]);
    const next = vi.fn().mockResolvedValue(new NextResponse('ok'));

    const req = mockRequest();
    await withAxiom(req, mockEvent(), next);

    expect(req.headers.get('x-trace-id')).toBeDefined();
  });

  it('logs request info via transformMiddlewareRequest', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    const message = 'request-log';
    const context = { path: '/test' };
    transformMiddlewareRequestMock.mockReturnValue([message, context]);
    const next = vi.fn().mockResolvedValue(new NextResponse('ok'));

    await withAxiom(mockRequest(), mockEvent(), next);

    expect(transformMiddlewareRequestMock).toHaveBeenCalled();
    expect(axiomLoggerMock.info).toHaveBeenCalledWith(
      message,
      expect.objectContaining({ ...context, traceId: expect.any(String) }),
    );
  });

  it('logs request completed with duration and status', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);

    const START = 1000;
    const END = 1050;
    const EXPECTED_DURATION = END - START;
    let now = START;
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    const next = vi.fn().mockImplementation(async () => {
      now = END;
      return new NextResponse('ok', { status: 200 });
    });

    await withAxiom(mockRequest(), mockEvent(), next);

    expect(axiomLoggerMock.info).toHaveBeenCalledWith(
      'Request completed',
      expect.objectContaining({
        method: 'GET',
        status: 200,
        duration: EXPECTED_DURATION,
        traceId: expect.any(String),
      }),
    );
    vi.restoreAllMocks();
  });

  it('sets x-trace-id cookie on NextResponse', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const response = new NextResponse('ok');
    const next = vi.fn().mockResolvedValue(response);

    await withAxiom(mockRequest(), mockEvent(), next);

    expect(response.cookies.get('x-trace-id')).toBeDefined();
    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toContain('x-trace-id=');
    expect(setCookie).toMatch(/SameSite=Strict/i);
    expect(setCookie).toMatch(/Path=\//);
    expect(setCookie).not.toMatch(/HttpOnly/i);
  });

  it('sets x-trace-id header on plain Response but does not set cookie', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const response = new Response('ok');
    const next = vi.fn().mockResolvedValue(response);

    await withAxiom(mockRequest(), mockEvent(), next);

    expect(response.headers.get('x-trace-id')).toBeDefined();
  });

  it('calls event.waitUntil with logger.flush', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const event = mockEvent();
    const next = vi.fn().mockResolvedValue(new NextResponse('ok'));

    await withAxiom(mockRequest(), event, next);

    expect(event.waitUntil).toHaveBeenCalledWith(expect.any(Promise));
  });

  it('does not break when transformMiddlewareRequest throws', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockImplementation(() => {
      throw new Error('transform failed');
    });
    const next = vi.fn().mockResolvedValue(new NextResponse('ok'));

    const result = await withAxiom(mockRequest(), mockEvent(), next);

    expect(result).toBeDefined();
  });

  it('does not break when logger.flush throws', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    axiomLoggerMock.flush.mockRejectedValueOnce(new Error('flush failed'));
    const next = vi.fn().mockResolvedValue(new NextResponse('ok'));

    const result = await withAxiom(mockRequest(), mockEvent(), next);

    expect(result).toBeDefined();
  });

  it('throws when next returns no response', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const next = vi.fn().mockResolvedValue(undefined as never);

    await expect(withAxiom(mockRequest(), mockEvent(), next)).rejects.toThrow(
      /.+/,
    );
  });

  it('logs status 500 when response is undefined in finally block', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const next = vi.fn().mockResolvedValue(undefined as never);

    await expect(withAxiom(mockRequest(), mockEvent(), next)).rejects.toThrow();

    expect(axiomLoggerMock.info).toHaveBeenCalledWith(
      'Request completed',
      expect.objectContaining({ status: 500 }),
    );
  });
});
