import { proxy } from './proxy';
import { NextResponse } from 'next/server';

export async function middleware(request: Request) {
  const response = await proxy(request);

  if (response instanceof NextResponse && process.env.NODE_ENV === 'production') {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.google-analytics.com https://vercel.live https://*.vercel.live https://*.auth0.com",
      "connect-src 'self' https://*.google.com https://*.google-analytics.com https://vercel.live https://*.vercel.live https://*.auth0.com https://displaycellpros.us.auth0.com wss://*.vercel.live",
      "img-src 'self' data: blob: https://*.google.com https://*.google-analytics.com https://*.gstatic.com https://*.auth0.com https://*.githubusercontent.com https://picsum.photos https://*.picsum.photos https://images.unsplash.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "frame-src 'self' https://vercel.live https://*.vercel.live https://*.auth0.com",
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

