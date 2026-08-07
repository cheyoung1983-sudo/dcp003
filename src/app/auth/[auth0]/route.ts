import { NextRequest, NextResponse } from 'next/server';

/**
 * Redundant route handler for Auth0 SDK v4.
 * SDK v4 handles /auth/* routes via the proxy/middleware in src/middleware.ts.
 * This file is kept as a fallback but will redirect to root if hit directly.
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url));
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL('/', request.url));
}
