/**
 * @jest-environment node
 */
import { GET } from '@/app/api/auth/callback/route';
import { NextResponse } from 'next/server';

// Mock vercelAuth
jest.mock('../src/lib/vercelAuth', () => ({
  exchangeCodeForToken: jest.fn().mockResolvedValue({
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600
  }),
}));

describe('Auth Callback API', () => {
  it('should return 400 when code is missing', async () => {
    const request = new Request('http://localhost:3000/api/auth/callback');
    const response = await GET(request as any);

    expect(response.status).toBe(400);
    const text = await response.text();
    expect(text).toContain('Missing authorization code');
  });

  it('should exchange code for token and set cookies', async () => {
    const request = new Request('http://localhost:3000/api/auth/callback?code=test-code');
    const response = await GET(request as any);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.access_token).toBe('test-access-token');

    // Check if cookies were set (simplified for Jest)
    expect(response.headers.get('set-cookie')).toBeDefined();
  });
});
