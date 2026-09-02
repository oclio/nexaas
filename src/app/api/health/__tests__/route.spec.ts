import { vi } from 'vitest';

import { mockNextRequest } from '@/tests/unit/helpers/request';

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

const checkDatabaseServiceMock = vi.fn();
vi.mock('@/core/db/health', () => ({
  checkDatabaseService: checkDatabaseServiceMock,
}));

const { GET } = await import('../route');

const mockRequest = (headers: Record<string, string> = {}) =>
  mockNextRequest({ headers });

const SERVICE_PATHS = {
  security: 'security',
  logs: 'logs',
  errorsCapture: 'errorsCapture',
  database: 'database',
} as const;

const SERVICE_MOCKS = {
  security: checkArcjetServiceMock,
  logs: checkAxiomServiceMock,
  errorsCapture: checkSentryServiceMock,
  database: checkDatabaseServiceMock,
} as const;

function setAllServicesHealthy() {
  checkArcjetServiceMock.mockResolvedValue({ status: 'healthy' });
  checkAxiomServiceMock.mockResolvedValue({ status: 'healthy' });
  checkSentryServiceMock.mockResolvedValue({ status: 'healthy' });
  checkDatabaseServiceMock.mockResolvedValue({ status: 'healthy' });
}

function setServiceStatus(
  service: keyof typeof SERVICE_MOCKS,
  status: 'healthy' | 'unhealthy' | 'disabled',
) {
  SERVICE_MOCKS[service].mockResolvedValue({ status });
}

async function fetchHealth(headers: Record<string, string> = {}) {
  const { GET: freshGET } = await import('../route');
  const response = await freshGET(mockRequest(headers));
  const body = await response.json();
  return { response, body };
}

describe('GET /api/health', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('returns ok without services when not authorized', async () => {
    const response = await GET(mockRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it('returns ok without services when authorization header is missing', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    const { response, body } = await fetchHealth();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it('returns ok without services when authorization header is wrong', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    const { response, body } = await fetchHealth({
      authorization: 'Bearer wrong',
    });

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it('returns ok without services when HEALTH_CHECK_SECRET is unset even if header is provided', async () => {
    const { response, body } = await fetchHealth({
      authorization: 'Bearer test-secret',
    });

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it('returns detailed health when authorized and all services are healthy', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    setAllServicesHealthy();
    const { response, body } = await fetchHealth({
      authorization: 'Bearer test-secret',
    });

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services.security.status).toBe('healthy');
    expect(body.services.logs.status).toBe('healthy');
    expect(body.services.errorsCapture.status).toBe('healthy');
    expect(body.services.database.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
    expect(response.headers.get('Cache-Control')).toMatch(/no-store/);
  });

  it.each([
    { service: 'security' as const },
    { service: 'logs' as const },
    { service: 'errorsCapture' as const },
    { service: 'database' as const },
  ])('returns 503 when $service service is unhealthy', async ({ service }) => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    setAllServicesHealthy();
    setServiceStatus(service, 'unhealthy');
    const { response, body } = await fetchHealth({
      authorization: 'Bearer test-secret',
    });

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services[SERVICE_PATHS[service]].status).toBe('unhealthy');
  });

  it('returns 200 when all services are disabled', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    setServiceStatus('security', 'disabled');
    setServiceStatus('logs', 'disabled');
    setServiceStatus('errorsCapture', 'disabled');
    checkDatabaseServiceMock.mockResolvedValue({ status: 'healthy' });
    const { response, body } = await fetchHealth({
      authorization: 'Bearer test-secret',
    });

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services.security.status).toBe('disabled');
    expect(body.services.logs.status).toBe('disabled');
    expect(body.services.errorsCapture.status).toBe('disabled');
    expect(body.services.database.status).toBe('healthy');
  });

  it('returns 200 when one service is healthy and the others disabled', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    setServiceStatus('security', 'disabled');
    checkAxiomServiceMock.mockResolvedValue({ status: 'healthy' });
    setServiceStatus('errorsCapture', 'disabled');
    checkDatabaseServiceMock.mockResolvedValue({ status: 'healthy' });
    const { response, body } = await fetchHealth({
      authorization: 'Bearer test-secret',
    });

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
  });

  it.each([
    { service: 'security' as const },
    { service: 'logs' as const },
    { service: 'errorsCapture' as const },
    { service: 'database' as const },
  ])('treats a rejected $service service as unhealthy', async ({ service }) => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'test-secret');
    setAllServicesHealthy();
    SERVICE_MOCKS[service].mockRejectedValue(new Error('connection refused'));
    const { response, body } = await fetchHealth({
      authorization: 'Bearer test-secret',
    });

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services[SERVICE_PATHS[service]].status).toBe('unhealthy');
  });
});
