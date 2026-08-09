import { NextRequest, NextResponse } from 'next/server';
import { AutonomaHandler } from '@autonoma-ai/server-web';
import { AutonomaSDK } from '@autonoma-ai/sdk';

// Configure the SDK/handler here if needed
const handler = new AutonomaHandler({
  // The SDK automatically reads process.env.AUTONOMA_SHARED_SECRET
});

export const POST = async (req: NextRequest) => {
  return handler.handleRequest(req);
};
