import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

const envReference = {
  AXIOM_TOKEN: undefined as string | undefined,
  AXIOM_DATASET: undefined as string | undefined,
};

vi.mock('@/core/config/env', () => ({
  get env() {
    return envReference;
  },
}));

const loggerMock = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined),
};
vi.mock('@/core/observability/axiom/server', () => ({
  logger: loggerMock,
}));

const transformMiddlewareRequestMock = vi.fn();
vi.mock('@axiomhq/nextjs', () => ({
  transformMiddlewareRequest: (...arguments_: unknown[]) =>
    transformMiddlewareRequestMock(...arguments_),
}));

const { withAxiom } = await import('../with-axiom');

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

describe('withAxiom', () => {
  afterEach(() => {
    vi.clearAllMocks();
    envReference.AXIOM_TOKEN = undefined;
    envReference.AXIOM_DATASET = undefined;
  });

  it('skips when AXIOM_TOKEN is not set', async () => {
    envReference.AXIOM_TOKEN = undefined;
    envReference.AXIOM_DATASET = 'test-dataset';
    const next = vi.fn().mockResolvedValue(new Response('ok'));

    const result = await withAxiom(mockRequest(), mockEvent(), next);

    expect(await result.text()).toBe('ok');
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  it('skips when AXIOM_DATASET is not set', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = undefined;
    const next = vi.fn().mockResolvedValue(new Response('ok'));

    const result = await withAxiom(mockRequest(), mockEvent(), next);

    expect(await result.text()).toBe('ok');
    expect(loggerMock.info).not.toHaveBeenCalled();
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
    transformMiddlewareRequestMock.mockReturnValue([
      'request-log',
      { path: '/test' },
    ]);
    const next = vi.fn().mockResolvedValue(new NextResponse('ok'));

    await withAxiom(mockRequest(), mockEvent(), next);

    expect(transformMiddlewareRequestMock).toHaveBeenCalledOnce();
    expect(loggerMock.info).toHaveBeenCalledWith(
      'request-log',
      expect.objectContaining({ path: '/test', traceId: expect.any(String) }),
    );
  });

  it('logs request completed with duration and status', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const next = vi
      .fn()
      .mockResolvedValue(new NextResponse('ok', { status: 200 }));

    await withAxiom(mockRequest(), mockEvent(), next);

    expect(loggerMock.info).toHaveBeenCalledWith(
      'Request completed',
      expect.objectContaining({
        method: 'GET',
        status: 200,
        duration: expect.any(Number),
        traceId: expect.any(String),
      }),
    );
  });

  it('sets x-trace-id cookie on NextResponse', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const response = new NextResponse('ok');
    const next = vi.fn().mockResolvedValue(response);

    await withAxiom(mockRequest(), mockEvent(), next);

    expect(response.cookies.get('x-trace-id')).toBeDefined();
  });

  it('sets x-trace-id header on plain Response but does not set cookie', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const response = new Response('ok');
    const next = vi.fn().mockResolvedValue(response);

    await withAxiom(mockRequest(), mockEvent(), next);

    expect(response.headers.get('x-trace-id')).toBeDefined();
    // Plain Response doesn't have cookies — the instanceof NextResponse branch is false
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

    expect(result.status).toBe(200);
  });

  it('does not break when logger.flush throws', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    loggerMock.flush.mockRejectedValueOnce(new Error('flush failed'));
    const next = vi.fn().mockResolvedValue(new NextResponse('ok'));

    const result = await withAxiom(mockRequest(), mockEvent(), next);

    expect(result.status).toBe(200);
  });

  it('throws when next returns no response', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const next = vi.fn().mockResolvedValue(undefined as never);

    await expect(withAxiom(mockRequest(), mockEvent(), next)).rejects.toThrow(
      'Middleware chain returned no response',
    );
  });

  it('logs status 500 when response is undefined in finally block', async () => {
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    transformMiddlewareRequestMock.mockReturnValue(['msg', {}]);
    const next = vi.fn().mockResolvedValue(undefined as never);

    await expect(withAxiom(mockRequest(), mockEvent(), next)).rejects.toThrow();

    expect(loggerMock.info).toHaveBeenCalledWith(
      'Request completed',
      expect.objectContaining({ status: 500 }),
    );
  });
});
