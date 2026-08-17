import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized Laboratory Access", details: "Session required to access diagnostic telemetry." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: "ok",
    message: "Diagnostic telemetry stream authorized.",
    authorizedTech: {
      name: session.user.name,
      id: session.user.sub
    },
    serverTime: new Date().toISOString()
  });
}
