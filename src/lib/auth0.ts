import { Auth0Client } from '@auth0/nextjs-auth0/server';

function getAuth0Client() {
  const domain = process.env.AUTH0_DOMAIN || process.env.AUTH0_ISSUER_BASE_URL || 'displaycellpros.us.auth0.com';
  const clientId = process.env.AUTH0_CLIENT_ID || 'dummy_client_id_for_preview';
  const clientSecret = process.env.AUTH0_CLIENT_SECRET || 'dummy_client_secret_for_preview';
  const secret = process.env.AUTH0_SECRET || 'a-32-byte-long-secret-key-for-auth0-session-encryption-fallback!';
  const appBaseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';

  try {
    return new Auth0Client({
      domain,
      clientId,
      clientSecret,
      secret,
      appBaseUrl,
    });
  } catch (err) {
    console.warn('[AI Studio] Auth0 client fallback initialization:', err);
    return new Auth0Client({
      domain: 'displaycellpros.us.auth0.com',
      clientId: 'dummy_client_id_for_preview',
      clientSecret: 'dummy_client_secret_for_preview',
      secret: 'a-32-byte-long-secret-key-for-auth0-session-encryption-fallback!',
      appBaseUrl: 'http://localhost:3000',
    });
  }
}

export const auth0 = getAuth0Client();

