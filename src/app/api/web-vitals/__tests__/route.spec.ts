import { vi } from 'vitest';

import { mockPostRequest } from '@/tests/unit/helpers/request';
import { axiomClientReference } from '@/tests/unit/mocks/observability';

import { POST } from '../route';

function mockRequest(body: unknown): Request {
  return mockPostRequest('http://localhost:3000/api/web-vitals', body);
}

describe('POST /api/web-vitals', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    axiomClientReference.value = undefined;
  });

  it.each([
    {
      name: 'NODE_ENV is not production',
      nodeEnv: 'development',
      dataset: 'test-dataset',
      hasClient: true,
    },
    {
      name: 'axiomClient is undefined',
      nodeEnv: 'production',
      dataset: 'test-dataset',
      hasClient: false,
    },
    {
      name: 'AXIOM_DATASET is not set',
      nodeEnv: 'production',
      dataset: undefined,
      hasClient: true,
    },
  ])(
    'returns ignored when $name',
    async ({
      nodeEnv,
      dataset,
      hasClient,
    }: {
      nodeEnv: string;
      dataset: string | undefined;
      hasClient: boolean;
    }) => {
      vi.stubEnv('NODE_ENV', nodeEnv);
      vi.stubEnv('AXIOM_TOKEN', 'test-token');
      vi.stubEnv('AXIOM_DATASET', dataset as unknown as string);
      const ingestMock = vi.fn();
      axiomClientReference.value = hasClient
        ? { ingest: ingestMock, flush: vi.fn() }
        : undefined;

      const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('ignored');
      expect(ingestMock).not.toHaveBeenCalled();
    },
  );

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
    expect(body.status).toBe('ok');
    expect(ingestMock).toHaveBeenCalledWith('test-dataset', {
      _time: expect.any(String),
      type: 'web-vitals',
      name: 'CLS',
      value: 0.1,
      id: 'v3-abc',
    });
    expect(flushMock).toHaveBeenCalled();
  });

  it.each([
    { rejectingMock: 'ingest' as const, message: 'network failure' },
    { rejectingMock: 'flush' as const, message: 'flush failure' },
  ])(
    'returns 500 when $rejectingMock throws',
    async ({ rejectingMock, message }) => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('AXIOM_TOKEN', 'test-token');
      vi.stubEnv('AXIOM_DATASET', 'test-dataset');
      const ingestMock =
        rejectingMock === 'ingest'
          ? vi.fn().mockRejectedValue(new Error(message))
          : vi.fn().mockResolvedValue(undefined);
      const flushMock =
        rejectingMock === 'flush'
          ? vi.fn().mockRejectedValue(new Error(message))
          : vi.fn();
      axiomClientReference.value = { ingest: ingestMock, flush: flushMock };

      const response = await POST(mockRequest({ name: 'CLS', value: 0.1 }));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.status).toBe('error');
      expect(body.error).toMatch(new RegExp(message, 'i'));
    },
  );

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
    expect(body.error).toBeTruthy();
  });
});
