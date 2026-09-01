import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';

import { withCsrf } from '../with-csrf';

const APP_URL = 'http://localhost:3000';

function mockRequest(
  method = 'GET',
  headers: Record<string, string> = {},
): NextRequest {
  return mockNextRequest({ method, headers });
}

const mockEvent = mockNextFetchEvent;

function nextMock() {
  return vi.fn().mockResolvedValue(NextResponse.next());
}

describe('withCsrf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['GET', 'HEAD', 'OPTIONS'])(
    'calls next for safe methods (%s)',
    async (method) => {
      const next = nextMock();

      await withCsrf(mockRequest(method), mockEvent(), next);

      expect(next).toHaveBeenCalled();
    },
  );

  it.each(['GET', 'HEAD', 'OPTIONS'])(
    'calls next for safe methods (%s) even with mismatched Origin',
    async (method) => {
      const next = nextMock();

      await withCsrf(
        mockRequest(method, { origin: 'https://evil.com' }),
        mockEvent(),
        next,
      );

      expect(next).toHaveBeenCalled();
    },
  );

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    'calls next for %s when Origin matches app URL',
    async (method) => {
      const next = nextMock();

      await withCsrf(
        mockRequest(method, { origin: APP_URL }),
        mockEvent(),
        next,
      );

      expect(next).toHaveBeenCalled();
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
      expect(await response.text()).toBeTruthy();
      expect(next).not.toHaveBeenCalled();
    },
  );

  it('allows POST without Origin header (non-browser request)', async () => {
    const next = nextMock();

    await withCsrf(mockRequest('POST'), mockEvent(), next);

    expect(next).toHaveBeenCalled();
  });

  it('allows POST with empty Origin header', async () => {
    const next = nextMock();

    await withCsrf(mockRequest('POST', { origin: '' }), mockEvent(), next);

    expect(next).toHaveBeenCalled();
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
