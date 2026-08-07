import { NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';

export const dynamic = 'force-dynamic';

/**
 * Main Auth0 route handler for SDK v4.
 * Handles /auth/login, /auth/logout, /auth/callback, /auth/me, etc.
 * The SDK automatically parses the path and executes the correct logic.
 */
export async function GET(req: any, ctx: any) {
  if (typeof auth0.handleAuth === 'function') {
    return auth0.handleAuth()(req, ctx);
  }
  return new Response('Auth0 handleAuth not available', { status: 500 });
}

export async function POST(req: any, ctx: any) {
  if (typeof auth0.handleAuth === 'function') {
    return auth0.handleAuth()(req, ctx);
  }
  return new Response('Auth0 handleAuth not available', { status: 500 });
}
