import { NextRequest } from 'next/server';
import { auth0 } from '@/lib/auth0';

export const dynamic = 'force-dynamic';

/**
 * Main Auth0 route handler for SDK v4.
 * Handles /auth/login, /auth/logout, /auth/callback, /auth/me, etc.
 * The SDK automatically parses the path and executes the correct logic.
 */
export const GET = auth0.handleAuth();
export const POST = auth0.handleAuth();
