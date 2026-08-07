/**
 * @jest-environment node
 */
import { GET } from '@/app/api/auth/signin/route';
import { NextResponse } from 'next/server';

// Mock environment variables
process.env.VERCEL_CLIENT_ID = 'test-client-id';
process.env.VERCEL_OAUTH_REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

describe('Auth SignIn API', () => {
  it('should redirect to Vercel OAuth URL', async () => {
    const response = await GET() as NextResponse;

    expect(response.status).toBe(307); // NextResponse.redirect defaults to 307
    expect(response.headers.get('location')).toContain('https://api.vercel.com/v2/oauth/authorize');
    expect(response.headers.get('location')).toContain('client_id=test-client-id');
  });
});
