import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/autonoma/userFactory';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;
    
    // In a real integration, you would verify the request is from Autonoma
    // or use the auth callback protocol defined by the SDK.
    // For now, we seed the user so tests can authenticate as them.
    const user = await createUser({ email, name });
    
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ error: "Failed to authenticate" }, { status: 500 });
  }
}
