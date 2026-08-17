import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function GET(request: NextRequest, { params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return auth0.handleAuth()(request, resolvedParams);
}

export async function POST(request: NextRequest, { params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return auth0.handleAuth()(request, resolvedParams);
}
