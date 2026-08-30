import { vi } from 'vitest';

import { mockPostRequest } from '@/tests/unit/helpers/request';
import { axiomClientReference } from '@/tests/unit/mocks/observability';

const { POST } = await import('../route');

function mockRequest(body: unknown): Request {
  return mockPostRequest('http://localhost:3000/api/web-vitals', body);
}

describe('POST /api/web-vitals', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    axiomClientReference.value = undefined;
  });

  it('returns ignored when NODE_ENV is not production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('AXIOM_TOKEN', 'test-token');
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');
    const ingestMock = vi.fn();
    axiomClientReference.value = { ingest: ingestMock, flush: vi.fn() };

    const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ignored' });
    expect(ingestMock).not.toHaveBeenCalled();
  });

  it('returns ignored when axiomClient is undefined', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AXIOM_TOKEN', 'test-token');
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');
    axiomClientReference.value = undefined;

    const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ignored' });
  });

  it('returns ignored when AXIOM_DATASET is not set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AXIOM_TOKEN', 'test-token');
    vi.stubEnv('AXIOM_DATASET', undefined as unknown as string);
    axiomClientReference.value = { ingest: vi.fn(), flush: vi.fn() };

    const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ignored' });
  });

  it('ingests the metric and returns ok', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AXIOM_TOKEN', 'test-token');
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');
    const ingestMock = vi.fn().mockResolvedValue(undefined);
    const flushMock = vi.fn().mockResolvedValue(undefined);
    axiomClientReference.value = { ingest: ingestMock, flush: flushMock };

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
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AXIOM_TOKEN', 'test-token');
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');
    const ingestMock = vi.fn().mockRejectedValue(new Error('network failure'));
    const flushMock = vi.fn();
    axiomClientReference.value = { ingest: ingestMock, flush: flushMock };

    const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.status).toBe('error');
    expect(body.error).toBe('Network failure.');
  });

  it('returns 500 when request.json() throws', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('AXIOM_TOKEN', 'test-token');
    vi.stubEnv('AXIOM_DATASET', 'test-dataset');
    axiomClientReference.value = {
      ingest: vi.fn(),
      flush: vi.fn(),
    };

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
