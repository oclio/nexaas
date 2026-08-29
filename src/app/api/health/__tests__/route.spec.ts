import type { NextRequest } from 'next/server';
import { vi } from 'vitest';

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

const checkSentryServiceMock = vi.fn();
vi.mock('@/core/observability/sentry/health', () => ({
  checkSentryService: checkSentryServiceMock,
}));

const checkArcjetServiceMock = vi.fn();
vi.mock('@/core/security/arcjet/health', () => ({
  checkArcjetService: checkArcjetServiceMock,
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

  it('returns detailed health when authorized and all services are healthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkArcjetServiceMock.mockResolvedValue({ status: 'healthy' });
    checkAxiomServiceMock.mockResolvedValue({ status: 'healthy' });
    checkSentryServiceMock.mockResolvedValue({ status: 'healthy' });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services.security.status).toBe('healthy');
    expect(body.services.logs.status).toBe('healthy');
    expect(body.services.errorsCapture.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
  });

  it('returns 503 when security service is unhealthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkArcjetServiceMock.mockResolvedValue({
      status: 'unhealthy',
      error: 'timeout',
    });
    checkAxiomServiceMock.mockResolvedValue({ status: 'healthy' });
    checkSentryServiceMock.mockResolvedValue({ status: 'healthy' });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.security.status).toBe('unhealthy');
    expect(body.services.logs.status).toBe('healthy');
    expect(body.services.errorsCapture.status).toBe('healthy');
  });

  it('returns 503 when logs service is unhealthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkArcjetServiceMock.mockResolvedValue({ status: 'healthy' });
    checkAxiomServiceMock.mockResolvedValue({
      status: 'unhealthy',
      error: 'timeout',
    });
    checkSentryServiceMock.mockResolvedValue({ status: 'healthy' });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.security.status).toBe('healthy');
    expect(body.services.logs.status).toBe('unhealthy');
    expect(body.services.errorsCapture.status).toBe('healthy');
  });

  it('returns 503 when errorsCapture service is unhealthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkArcjetServiceMock.mockResolvedValue({ status: 'healthy' });
    checkAxiomServiceMock.mockResolvedValue({ status: 'healthy' });
    checkSentryServiceMock.mockResolvedValue({
      status: 'unhealthy',
      reason: 'Client not initialized',
    });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.security.status).toBe('healthy');
    expect(body.services.logs.status).toBe('healthy');
    expect(body.services.errorsCapture.status).toBe('unhealthy');
  });

  it('returns 200 when all services are disabled', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkArcjetServiceMock.mockResolvedValue({ status: 'disabled' });
    checkAxiomServiceMock.mockResolvedValue({ status: 'disabled' });
    checkSentryServiceMock.mockResolvedValue({ status: 'disabled' });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services.security.status).toBe('disabled');
    expect(body.services.logs.status).toBe('disabled');
    expect(body.services.errorsCapture.status).toBe('disabled');
  });

  it('returns 200 when one service is healthy and the others disabled', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkArcjetServiceMock.mockResolvedValue({ status: 'disabled' });
    checkAxiomServiceMock.mockResolvedValue({ status: 'healthy' });
    checkSentryServiceMock.mockResolvedValue({ status: 'disabled' });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it('treats a rejected security service as unhealthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkArcjetServiceMock.mockRejectedValue(new Error('connection refused'));
    checkAxiomServiceMock.mockResolvedValue({ status: 'healthy' });
    checkSentryServiceMock.mockResolvedValue({ status: 'healthy' });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.security.status).toBe('unhealthy');
  });

  it('treats a rejected logs service as unhealthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkArcjetServiceMock.mockResolvedValue({ status: 'healthy' });
    checkAxiomServiceMock.mockRejectedValue(new Error('connection refused'));
    checkSentryServiceMock.mockResolvedValue({ status: 'healthy' });
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.logs.status).toBe('unhealthy');
  });

  it('treats a rejected errorsCapture service as unhealthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    checkArcjetServiceMock.mockResolvedValue({ status: 'healthy' });
    checkAxiomServiceMock.mockResolvedValue({ status: 'healthy' });
    checkSentryServiceMock.mockRejectedValue(new Error('fetch failed'));
    const { GET: freshGET } = await import('../route');

    const response = await freshGET(
      mockRequest({ authorization: 'Bearer test-secret' }),
    );
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.errorsCapture.status).toBe('unhealthy');
  });
});
