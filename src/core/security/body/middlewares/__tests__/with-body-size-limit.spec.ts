import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

import {
  mockNextFetchEvent,
  mockNextRequest,
} from '@/tests/unit/helpers/request';

import { withBodySizeLimit } from '../with-body-size-limit';

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

describe('withBodySizeLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['GET', 'HEAD', 'OPTIONS', 'DELETE'])(
    'calls next for methods without body (%s)',
    async (method) => {
      const next = nextMock();

      await withBodySizeLimit(
        mockRequest(method, { 'content-length': '999999999' }),
        mockEvent(),
        next,
      );

      expect(next).toHaveBeenCalled();
    },
  );

  it.each(['POST', 'PUT', 'PATCH'])(
    'calls next for %s when Content-Length is within limit',
    async (method) => {
      const next = nextMock();

      await withBodySizeLimit(
        mockRequest(method, { 'content-length': '1024' }),
        mockEvent(),
        next,
      );

      expect(next).toHaveBeenCalled();
    },
  );

  it.each(['POST', 'PUT', 'PATCH'])(
    'calls next for %s when Content-Length is exactly 1MB',
    async (method) => {
      const next = nextMock();

      await withBodySizeLimit(
        mockRequest(method, { 'content-length': String(1024 * 1024) }),
        mockEvent(),
        next,
      );

      expect(next).toHaveBeenCalled();
    },
  );

  it.each(['POST', 'PUT', 'PATCH'])(
    'returns 413 for %s when Content-Length exceeds 1MB',
    async (method) => {
      const next = nextMock();

      const response = await withBodySizeLimit(
        mockRequest(method, { 'content-length': String(1024 * 1024 + 1) }),
        mockEvent(),
        next,
      );

      expect(response.status).toBe(413);
      expect(await response.text()).toBeTruthy();
      expect(next).not.toHaveBeenCalled();
    },
  );

  it.each(['POST', 'PUT', 'PATCH'])(
    'allows %s without Content-Length header (chunked encoding)',
    async (method) => {
      const next = nextMock();
      const numberSpy = vi.spyOn(globalThis, 'Number');

      await withBodySizeLimit(mockRequest(method), mockEvent(), next);

      expect(next).toHaveBeenCalled();
      expect(numberSpy).not.toHaveBeenCalled();
    },
  );

  it('returns 413 when Content-Length is not a number', async () => {
    const next = nextMock();

    const response = await withBodySizeLimit(
      mockRequest('POST', { 'content-length': 'not-a-number' }),
      mockEvent(),
      next,
    );

    expect(response.status).toBe(413);
    expect(next).not.toHaveBeenCalled();
  });
});
