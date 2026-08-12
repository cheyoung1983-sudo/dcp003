import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { prompt, model } = await req.json();

    const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI Gateway API Key, VERCEL_OIDC_TOKEN, or OPENAI_API_KEY environment variable is required." },
        { status: 401 }
      );
    }

    const result = await generateText({
      model: model || 'xai/grok-4.5',
      prompt: prompt || 'Explain device repair and diagnostics best practices.',
    });

    return NextResponse.json({ text: result.text });
  } catch (err: any) {
    console.error("[AI Gateway Chat Route Error]:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "unconfigured",
      message: "Missing AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN",
    });
  }

  try {
    const result = await generateText({
      model: 'xai/grok-4.5',
      prompt: 'Provide a 1-sentence welcome greeting for a smartphone repair shop.',
    });
    return NextResponse.json({ status: "active", greeting: result.text });
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: err.message || "Failed to execute test prompt with AI Gateway",
    });
  }
}
