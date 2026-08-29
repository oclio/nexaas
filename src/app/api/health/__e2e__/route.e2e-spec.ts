import { expect, test } from '@playwright/test';

test.describe('/api/health', () => {
  test('returns ok without services when not authorized', async ({
    request,
  }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });

  test('returns ok without services when authorization header is missing', async ({
    request,
  }) => {
    const response = await request.get('/api/health', {
      headers: { authorization: '' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });

  test('returns ok without services when authorization header is wrong', async ({
    request,
  }) => {
    const response = await request.get('/api/health', {
      headers: { authorization: 'Bearer wrong-secret' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });

  test('returns detailed health when authorized', async ({ request }) => {
    const response = await request.get('/api/health', {
      headers: { authorization: 'Bearer test-health-secret' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.services).toBeDefined();
    expect(body.services.security).toBeDefined();
    expect(body.services.logs).toBeDefined();
    expect(body.services.errorsCapture).toBeDefined();
    expect(['healthy', 'unhealthy', 'disabled']).toContain(
      body.services.security.status,
    );
    expect(['healthy', 'unhealthy', 'disabled']).toContain(
      body.services.logs.status,
    );
    expect(['healthy', 'unhealthy', 'disabled']).toContain(
      body.services.errorsCapture.status,
    );
    expect(response.headers()['cache-control']).toBe('no-store, max-age=0');
  });
});
