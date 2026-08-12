import { initAuth0 } from '@auth0/nextjs-auth0';

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
  if (!domainStr) return 'displaycellpros.us.auth0.com';
  let cleaned = domainStr.trim();
  if (!cleaned) return 'displaycellpros.us.auth0.com';

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    return parsed.hostname || 'displaycellpros.us.auth0.com';
  } catch {
    let stripped = cleaned.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0].split('#')[0].trim();
    return stripped || 'displaycellpros.us.auth0.com';
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

  const clientId = process.env.AUTH0_CLIENT_ID || 'dummy_client_id_for_preview';
  const clientSecret = process.env.AUTH0_CLIENT_SECRET || 'dummy_client_secret_for_preview';
  const secret = process.env.AUTH0_SECRET || 'a-32-byte-long-secret-key-for-auth0-session-encryption-fallback!';

  return { domain, clientId, clientSecret, secret, appBaseUrl };
}

function getAuth0Client() {
  const config = resolveAuth0Config();
  try {
    return initAuth0({
      secret: config.secret,
      issuerBaseURL: `https://${config.domain}`,
      baseURL: config.appBaseUrl,
      clientID: config.clientId,
      clientSecret: config.clientSecret,
    });
  } catch (err) {
    console.warn('[AI Studio] Auth0 client fallback initialization:', err);
    return initAuth0({
      secret: 'a-32-byte-long-secret-key-for-auth0-session-encryption-fallback!',
      issuerBaseURL: 'https://displaycellpros.us.auth0.com',
      baseURL: 'http://localhost:3000',
      clientID: 'dummy_client_id_for_preview',
      clientSecret: 'dummy_client_secret_for_preview',
    });
  }
}

export const auth0 = getAuth0Client();


