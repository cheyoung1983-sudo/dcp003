import { getTokenResponse, startAuthorization } from '@vercel/connect';
import type { ConnectTokenResponse as TokenResponse } from '@vercel/connect';

/**
 * Environment variables required:
 * - VERCEL_CLIENT_ID: OAuth client ID
 * - VERCEL_CLIENT_SECRET: OAuth client secret
 */
const CLIENT_ID = process.env.VERCEL_CLIENT_ID;
const CLIENT_SECRET = process.env.VERCEL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  // We use a warning instead of a throw here to allow the build to proceed
  // if these are not strictly needed during build time.
  console.warn('VERCEL_CLIENT_ID and VERCEL_CLIENT_SECRET are not set');
}

/**
 * Retrieves an access token for a given subject.
 */
export async function fetchVercelToken(
  subject: { type: 'app' } | { type: 'user'; id: string },
  scopes: string[] = ['openid', 'email', 'profile']
): Promise<TokenResponse> {
  const resource = 'mcp.vercel.com/sky-mountain';
  return await getTokenResponse(resource, {
    subject: subject as any,
    scopes,
  });
}

/**
 * Starts an interactive OAuth authorization flow for a user.
 */
export function initiateUserAuthorization(res: any, userId: string) {
  const resource = 'mcp.vercel.com/sky-mountain';
  const authUrl = startAuthorization(resource, {
    subject: { type: 'user', id: userId },
    scopes: ['openid', 'email', 'profile'],
  });
  res.writeHead(302, { Location: authUrl });
  res.end();
}

/**
 * Convenience wrapper that exchanges an authorization code for a token.
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const tokenEndpoint = 'https://api.vercel.com/login/oauth/token';
  const params = new URLSearchParams({
    client_id: CLIENT_ID || '',
    client_secret: CLIENT_SECRET || '',
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.VERCEL_OAUTH_REDIRECT_URI || '',
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token exchange failed: ${err}`);
  }
  return (await response.json()) as TokenResponse;
}

export async function refreshVercelToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID || '',
    client_secret: CLIENT_SECRET || '',
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const resp = await fetch('https://api.vercel.com/v2/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!resp.ok) {
    throw new Error(`Refresh failed: ${await resp.text()}`);
  }
  return (await resp.json()) as TokenResponse;
}
