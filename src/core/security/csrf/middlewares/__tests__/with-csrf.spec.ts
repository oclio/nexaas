import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

vi.mock('@/core/config/env', () => ({
  env: {
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

const { withCsrf } = await import('../with-csrf');

function mockRequest(
  method = 'GET',
  headers: Record<string, string> = {},
): NextRequest {
  return {
    headers: new Headers(headers),
    method,
    url: 'http://localhost:3000/test',
    nextUrl: { pathname: '/test' },
  } as unknown as NextRequest;
}

function mockEvent(): NextFetchEvent {
  return {} as unknown as NextFetchEvent;
}

function nextMock() {
  return vi.fn().mockResolvedValue(NextResponse.next());
}

describe('withCsrf', () => {
  it.each(['GET', 'HEAD', 'OPTIONS'])(
    'calls next for safe methods (%s)',
    async (method) => {
      const next = nextMock();

      await withCsrf(mockRequest(method), mockEvent(), next);

      expect(next).toHaveBeenCalledOnce();
    },
  );

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    'calls next for %s when Origin matches app URL',
    async (method) => {
      const next = nextMock();

      await withCsrf(
        mockRequest(method, { origin: 'http://localhost:3000' }),
        mockEvent(),
        next,
      );

      expect(next).toHaveBeenCalledOnce();
    },
  );

  it.each(['POST', 'PUT', 'DELETE', 'PATCH'])(
    'returns 403 for %s when Origin does not match',
    async (method) => {
      const next = nextMock();

      const response = await withCsrf(
        mockRequest(method, { origin: 'https://evil.com' }),
        mockEvent(),
        next,
      );

      expect(response.status).toBe(403);
      expect(await response.text()).toBe('CSRF check failed');
      expect(next).not.toHaveBeenCalled();
    },
  );

  it('allows POST without Origin header (non-browser request)', async () => {
    const next = nextMock();

    await withCsrf(mockRequest('POST'), mockEvent(), next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('allows POST with empty Origin header', async () => {
    const next = nextMock();

    await withCsrf(mockRequest('POST', { origin: '' }), mockEvent(), next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('rejects POST with Origin matching but different port', async () => {
    const next = nextMock();

    const response = await withCsrf(
      mockRequest('POST', { origin: 'http://localhost:3001' }),
      mockEvent(),
      next,
    );

    expect(response.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects POST with Origin matching but different protocol', async () => {
    const next = nextMock();

    const response = await withCsrf(
      mockRequest('POST', { origin: 'https://localhost:3000' }),
      mockEvent(),
      next,
    );

    expect(response.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
