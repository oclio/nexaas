import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { config, proxy } from '@/proxy';

function mockRequest(): NextRequest {
  return { headers: new Headers() } as unknown as NextRequest;
}

function mockEvent(): NextFetchEvent {
  return {} as unknown as NextFetchEvent;
}

describe('proxy', () => {
  it('returns a NextResponse when no proxies are registered', async () => {
    const response = await proxy(mockRequest(), mockEvent());

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('is the default export', async () => {
    const { default: defaultExport } = await import('@/proxy');

    expect(defaultExport).toBe(proxy);
  });
});

describe('proxy config', () => {
  it('excludes _next, _vercel, monitoring, and files with dots', () => {
    expect(config.matcher).toContain(
      '/((?!_next|_vercel|monitoring|api/web-vitals|.*\\..*).*)',
    );
  });

  it('includes api and trpc routes', () => {
    expect(config.matcher).toContain('/(api|trpc)(.*)');
  });

  it('has exactly two matchers', () => {
    expect(config.matcher).toHaveLength(2);
  });
});
