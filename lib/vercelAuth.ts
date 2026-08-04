import { getToken, startAuthorization } from '@vercel/connect';
import type { TokenResponse } from '@vercel/connect/types';

/**
 * Environment variables required:
 * - VERCEL_CLIENT_ID: OAuth client ID
 * - VERCEL_CLIENT_SECRET: OAuth client secret
 */
const CLIENT_ID = process.env.VERCEL_CLIENT_ID;
const CLIENT_SECRET = process.env.VERCEL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('VERCEL_CLIENT_ID and VERCEL_CLIENT_SECRET must be set in environment variables');
}

/**
 * Retrieves an access token for a given subject.
 *
 * @param subject - The subject for which to obtain a token. Use { type: 'app' } or { type: 'user', id: '<user-id>' }.
 * @param scopes - Optional array of scopes. Defaults to openid, email, profile.
 * @returns A promise resolving to the token response.
 */
export async function fetchVercelToken(
  subject: { type: 'app' } | { type: 'user'; id: string },
  scopes: string[] = ['openid', 'email', 'profile']
): Promise<TokenResponse> {
  // The resource identifier is the Vercel MCP server for this project.
  const resource = 'mcp.vercel.com/sky-mountain';

  // @vercel/connect uses client_secret_basic authentication automatically when clientId and clientSecret are provided via env vars.
  // Pass subject and scopes.
  return await getToken(resource, {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    subject,
    scopes,
  });
}

/**
 * Starts an interactive OAuth authorization flow for a user.
 * This is useful when you need the user to consent to additional scopes.
 *
 * @param res - The Next.js response object used to redirect the user.
 * @param userId - The ID of the user you want to authorize.
 */
export function initiateUserAuthorization(res: any, userId: string) {
  const resource = 'mcp.vercel.com/sky-mountain';
  const authUrl = startAuthorization(resource, {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    subject: { type: 'user', id: userId },
    scopes: ['openid', 'email', 'profile'],
  });
  // Redirect the user to Vercel’s OAuth authorize endpoint.
  res.writeHead(302, { Location: authUrl });
  res.end();
}

/**
 * Convenience wrapper that exchanges an authorization code for a token.
 * Use this in the callback endpoint of your OAuth flow.
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const tokenEndpoint = 'https://api.vercel.com/login/oauth/token';
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.VERCEL_OAUTH_REDIRECT_URI!,
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
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
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
