import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Clear the Google session cookie
  const response = NextResponse.redirect(new URL('/auth/logout', req.url)); // Redirect to Auth0 logout

  response.cookies.set({
    name: 'google_session_token',
    value: '',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
