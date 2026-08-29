import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { vi } from 'vitest';

const { withBodySizeLimit } = await import('../with-body-size-limit');

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

describe('withBodySizeLimit', () => {
  it.each(['GET', 'HEAD', 'OPTIONS', 'DELETE'])(
    'calls next for methods without body (%s)',
    async (method) => {
      const next = nextMock();

      await withBodySizeLimit(
        mockRequest(method, { 'content-length': '999999999' }),
        mockEvent(),
        next,
      );

      expect(next).toHaveBeenCalledOnce();
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

      expect(next).toHaveBeenCalledOnce();
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

      expect(next).toHaveBeenCalledOnce();
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
      expect(await response.text()).toBe('Payload Too Large');
      expect(next).not.toHaveBeenCalled();
    },
  );

  it.each(['POST', 'PUT', 'PATCH'])(
    'allows %s without Content-Length header (chunked encoding)',
    async (method) => {
      const next = nextMock();

      await withBodySizeLimit(mockRequest(method), mockEvent(), next);

      expect(next).toHaveBeenCalledOnce();
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
