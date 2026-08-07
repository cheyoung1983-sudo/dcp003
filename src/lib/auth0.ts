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
  let rawBaseUrl = process.env.APP_BASE_URL || process.env.AUTH0_BASE_URL || process.env.NEXTAUTH_URL;

  // Auto-detect appBaseUrl on Vercel if not explicitly provided
  if (!rawBaseUrl && process.env.VERCEL_URL) {
    rawBaseUrl = `https://${process.env.VERCEL_URL}`;
  }

  // Detect if rawBaseUrl was mistakenly set to an Auth0 tenant domain
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

  if (process.env.NODE_ENV === 'production') {
    if (secret && secret.length < 32) {
      console.error('[Auth0] CRITICAL: AUTH0_SECRET is too short. It must be at least 32 characters long.');
    }
  }

  const config = {
    domain,
    clientId: clientId || 'iHyCQzrHYenv4lrkCFy4v9528jtJUUHl',
    clientSecret: clientSecret || '',
    secret: secret || '',
    appBaseUrl
  };

  if (process.env.NODE_ENV === 'production') {
    console.log('[Auth0] Resolved configuration:', {
      domain: config.domain,
      clientId: config.clientId,
      appBaseUrl: config.appBaseUrl,
      hasClientSecret: !!config.clientSecret,
      hasSecret: !!config.secret,
      secretLength: config.secret?.length
    });
  }

  return config;
}

function getAuth0Client() {
  const config = resolveAuth0Config();

  const isMissingSecrets = !config.clientSecret || !config.secret;
  const isDefaultBaseUrl = config.appBaseUrl === 'http://localhost:3000' && process.env.NODE_ENV === 'production';

  if (process.env.NODE_ENV === 'production') {
    if (isMissingSecrets) {
      console.error('[Auth0] CRITICAL: AUTH0_CLIENT_SECRET or AUTH0_SECRET is missing.');
    }
    if (isDefaultBaseUrl) {
      console.warn('[Auth0] WARNING: appBaseUrl is set to localhost in production. This will cause authentication failures.');
    }
  }

  try {
    // Auth0Client constructor will throw if mandatory fields are missing or invalid (like secret length)
    return new Auth0Client(config);
  } catch (err) {
    console.error('[Auth0] Client initialization failed. Check your environment variables and secret lengths.', err);
    // Return a proxy that catches middleware calls and returns a descriptive error
    return {
      middleware: async () => {
        return new Response(
          JSON.stringify({
            error: 'Auth0 configuration error',
            message: 'The authentication service is not properly configured. Check server logs for details.',
            details: process.env.NODE_ENV === 'development' ? String(err) : undefined
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      },
      getSession: async () => null,
      updateSession: async () => {},
      // Add other methods if needed
    } as any;
  }
}

export const auth0 = getAuth0Client();


