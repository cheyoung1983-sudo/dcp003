import { proxy } from './proxy';
import { NextResponse } from 'next/server';

export async function middleware(request: Request) {
  const url = new URL(request.url);

  // 1. Direct bypass for API routes to ensure they never hit the Auth0 proxy
  if (url.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const response = await proxy(request);

  if (response instanceof NextResponse && process.env.NODE_ENV === 'production') {
    const csp = [
      "default-src 'self'",
      "manifest-src 'self' https://vercel.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.gstatic.com https://*.google-analytics.com https://*.googletagmanager.com https://vercel.live https://*.vercel.live https://*.auth0.com",
      "connect-src 'self' https://*.google.com https://*.gstatic.com https://*.google-analytics.com https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.openai.com https://vercel.live https://*.vercel.live https://*.auth0.com https://icfg-lpfzl6ejhmeudwfnf0rviy2r.us.auth0.com wss://*.vercel.live",
      "img-src 'self' data: blob: https://*.google.com https://*.google-analytics.com https://*.gstatic.com https://*.auth0.com https://*.githubusercontent.com https://picsum.photos https://*.picsum.photos https://images.unsplash.com https://ai.google.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-src 'self' https://*.google.com https://*.gstatic.com https://vercel.live https://*.vercel.live https://*.auth0.com",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

