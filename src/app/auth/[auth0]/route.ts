import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function GET(request: NextRequest) {
  try {
    return await auth0.middleware(request);
  } catch (err) {
    console.warn('[Auth0 Route GET error]:', err);
    return NextResponse.json({ error: 'Auth0 request handling failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await auth0.middleware(request);
  } catch (err) {
    console.warn('[Auth0 Route POST error]:', err);
    return NextResponse.json({ error: 'Auth0 request handling failed' }, { status: 500 });
  }
}
