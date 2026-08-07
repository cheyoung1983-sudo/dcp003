import { Auth0Client } from '@auth0/nextjs-auth0/server';

function formatUrl(urlStr?: string): string | null {
  if (!urlStr) return null;
  const trimmed = urlStr.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function cleanDomain(domainStr?: string): string {
  if (!domainStr) return 'icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com';
  let cleaned = domainStr.trim();
  if (!cleaned) return 'icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com';

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    return parsed.hostname || 'icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com';
  } catch {
    let stripped = cleaned.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].split('#')[0].trim();
    return stripped || 'icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com';
  }
}

function resolveAuth0Config() {
  let envDomain = process.env.AUTH0_DOMAIN || process.env.AUTH0_ISSUER_BASE_URL;
  let rawBaseUrl = process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL;

  // Detect if rawBaseUrl was mistakenly set to an Auth0 tenant domain (e.g. "icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com")
  if (rawBaseUrl && rawBaseUrl.includes('auth0.com') && !rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://')) {
    if (!envDomain) {
      envDomain = rawBaseUrl;
    }
    rawBaseUrl = undefined;
  }

  const domain = cleanDomain(envDomain);
  
  let appBaseUrl = 'http://localhost:3000';
  if (rawBaseUrl) {
    const formatted = formatUrl(rawBaseUrl);
    if (formatted) {
      try {
        new URL(formatted);
        appBaseUrl = formatted;
      } catch {
        appBaseUrl = 'http://localhost:3000';
      }
    }
  }

  const clientId = process.env.AUTH0_CLIENT_ID;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET;
  const secret = process.env.AUTH0_SECRET;

  if (!clientId || !clientSecret || !secret) {
    console.error('[Auth0] Missing required environment variables. Authentication will not function correctly.');
    // In production, you might want to throw an error here.
  }

  return {
    domain,
    clientId: clientId || 'iHyCQzrHYenv4lrkCFy4v9528jtJUUHl',
    clientSecret: clientSecret || '',
    secret: secret || '',
    appBaseUrl
  };
}

function getAuth0Client() {
  const config = resolveAuth0Config();

  // Basic validation for production
  if (process.env.NODE_ENV === 'production' && (!config.clientSecret || !config.secret)) {
    throw new Error('AUTH0_CLIENT_SECRET and AUTH0_SECRET must be set in production');
  }

  try {
    return new Auth0Client(config);
  } catch (err) {
    console.error('[Auth0] Client initialization failed:', err);
    // Return a client that will fail gracefully or re-throw
    throw err;
  }
}

export const auth0 = getAuth0Client();


