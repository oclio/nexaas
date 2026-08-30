import type { NextFetchEvent, NextRequest } from 'next/server';
import { vi } from 'vitest';

interface MockNextRequestOptions {
  pathname?: string;
  headers?: Record<string, string>;
  method?: string;
  url?: string;
  cookies?: Record<string, string>;
}

export function mockNextRequest(
  options: MockNextRequestOptions = {},
): NextRequest {
  const {
    pathname = '/test',
    headers = {},
    method = 'GET',
    url = 'http://localhost:3000/test',
    cookies,
  } = options;
  const cookieMap = new Map(Object.entries(cookies ?? {}));
  return {
    headers: new Headers(headers),
    url,
    method,
    nextUrl: { pathname },
    cookies: {
      get: (name: string) => {
        const value = cookieMap.get(name);
        return value ? { name, value } : undefined;
      },
    },
  } as unknown as NextRequest;
}

export function mockNextFetchEvent(): NextFetchEvent {
  return {
    waitUntil: vi.fn(),
  } as unknown as NextFetchEvent;
}

export function mockPostRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}
