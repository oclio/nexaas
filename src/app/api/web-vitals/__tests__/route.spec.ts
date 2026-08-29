import { vi } from 'vitest';

vi.mock('@/core/observability/axiom/server', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const envReference = {
  NODE_ENV: 'test' as string,
  AXIOM_TOKEN: undefined as string | undefined,
  AXIOM_DATASET: undefined as string | undefined,
};

vi.mock('@/core/config/env', () => ({
  get env() {
    return envReference;
  },
}));

const ingestMock = vi.fn();
const flushMock = vi.fn();
const axiomClientReference: { value: unknown } = { value: undefined };
vi.mock('@/core/observability/axiom/client', () => ({
  get axiomClient() {
    return axiomClientReference.value;
  },
}));

const { POST } = await import('../route');

function mockRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/web-vitals', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/web-vitals', () => {
  afterEach(() => {
    vi.clearAllMocks();
    envReference.NODE_ENV = 'test';
    envReference.AXIOM_TOKEN = undefined;
    envReference.AXIOM_DATASET = undefined;
    axiomClientReference.value = undefined;
  });

  it('returns ignored when NODE_ENV is not production', async () => {
    envReference.NODE_ENV = 'development';
    const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ignored' });
  });

  it('returns ignored when axiomClient is undefined', async () => {
    envReference.NODE_ENV = 'production';
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    axiomClientReference.value = undefined;

    const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ignored' });
  });

  it('returns ignored when AXIOM_DATASET is not set', async () => {
    envReference.NODE_ENV = 'production';
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = undefined;
    axiomClientReference.value = { ingest: ingestMock, flush: flushMock };

    const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ignored' });
  });

  it('ingests the metric and returns ok', async () => {
    envReference.NODE_ENV = 'production';
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    axiomClientReference.value = { ingest: ingestMock, flush: flushMock };
    ingestMock.mockResolvedValue(undefined);
    flushMock.mockResolvedValue(undefined);

    const metric = { name: 'CLS', value: 0.1, id: 'v3-abc' };
    const response = await POST(mockRequest(metric));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok' });
    expect(ingestMock).toHaveBeenCalledWith('test-dataset', {
      _time: expect.any(String),
      type: 'web-vitals',
      name: 'CLS',
      value: 0.1,
      id: 'v3-abc',
    });
    expect(flushMock).toHaveBeenCalledOnce();
  });

  it('returns 500 when ingest throws', async () => {
    envReference.NODE_ENV = 'production';
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    axiomClientReference.value = { ingest: ingestMock, flush: flushMock };
    ingestMock.mockRejectedValue(new Error('network failure'));

    const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.status).toBe('error');
    expect(body.error).toBe('Network failure.');
  });

  it('returns 500 when request.json() throws', async () => {
    envReference.NODE_ENV = 'production';
    envReference.AXIOM_TOKEN = 'test-token';
    envReference.AXIOM_DATASET = 'test-dataset';
    axiomClientReference.value = { ingest: ingestMock, flush: flushMock };

    const badRequest = new Request('http://localhost:3000/api/web-vitals', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(badRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.status).toBe('error');
  });
});
