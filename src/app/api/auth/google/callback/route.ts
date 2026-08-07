import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { cookies } from 'next/headers';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * POST /api/auth/google/callback
 * Handles the ID token submission from Google One Tap / Sign-in Button.
 * Verifies the JWT and establishes a session.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const idToken = formData.get('credential') as string;
    const csrfToken = formData.get('g_csrf_token') as string;

    // Verify CSRF token if present (for HTML API submissions)
    const cookieStore = await cookies();
    const csrfCookie = cookieStore.get('g_csrf_token')?.value;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing credential' }, { status: 400 });
    }

    if (csrfToken && csrfCookie && csrfToken !== csrfCookie) {
      return NextResponse.json({ error: 'Failed to verify CSRF state' }, { status: 400 });
    }

    if (!GOOGLE_CLIENT_ID) {
      console.error('[Google Auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify the ID Token with Google
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const { sub: userId, email, name, picture } = payload;

    // Here you would typically:
    // 1. Find or create the user in your database (e.g. Prisma)
    // 2. Create a session/JWT for your app

    console.log('[Google Auth] Successfully verified user:', { email, name, userId });

    // Redirect to home or original destination after successful login
    const response = NextResponse.redirect(new URL('/', req.url), { status: 303 });

    // Set a session cookie (example using the ID token directly as a session - in production use a proper session JWT)
    response.cookies.set({
      name: 'google_session_token',
      value: idToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600 // 1 hour
    });

    return response;

  } catch (error: any) {
    console.error('[Google Auth] Callback error:', error);
    return NextResponse.json({ error: 'Authentication failed', details: error.message }, { status: 401 });
  }
}
