import type { NextRequest } from 'next/server';

vi.mock('@/core/observability/axiom/server', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const checkAxiomServiceMock = vi.fn();
vi.mock('@/core/observability/axiom/health', () => ({
  checkAxiomService: checkAxiomServiceMock,
}));

const { GET } = await import('../route');

function mockRequest(headers: Record<string, string> = {}): NextRequest {
  return {
    headers: new Headers(headers),
  } as unknown as NextRequest;
}

describe('GET /api/health', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('returns ok without services when not authorized', async () => {
    const response = await GET(mockRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok' });
  });

  it('returns ok without services when authorization header is missing', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(mockRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok' });
  });

  it('returns ok without services when authorization header is wrong', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer wrong' }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok' });
  });

  it('returns detailed health when authorized and services are healthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkAxiomServiceMock.mockResolvedValue({ status: 'healthy' });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services.logs.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
  });

  it('returns 503 when a service is unhealthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkAxiomServiceMock.mockResolvedValue({
      status: 'unhealthy',
      error: 'timeout',
    });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.logs.status).toBe('unhealthy');
  });

  it('returns 200 when a service is disabled', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkAxiomServiceMock.mockResolvedValue({ status: 'disabled' });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services.logs.status).toBe('disabled');
  });

  it('treats a rejected service as unhealthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkAxiomServiceMock.mockRejectedValue(new Error('connection refused'));
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.logs.status).toBe('unhealthy');
  });
});
