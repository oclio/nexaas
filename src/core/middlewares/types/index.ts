import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

export type CustomMiddleware = (
  request: NextRequest,
  event: NextFetchEvent,
  next: () => Promise<Response | NextResponse>,
) => Promise<Response | NextResponse>;
