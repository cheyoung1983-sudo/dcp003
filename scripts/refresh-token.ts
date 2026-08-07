// scripts/refresh-token.ts
import { refreshVercelToken } from "../lib/vercelAuth";
import * as fs from "fs";
import * as path from "path";

// Simple JSON file to persist tokens (replace with a real DB in production)
const storePath = path.resolve(__dirname, "../tokenStore.json");

async function refreshIfNeeded() {
  if (!fs.existsSync(storePath)) {
    console.warn("Token store not found at", storePath);
    return;
  }

  const raw = fs.readFileSync(storePath, "utf-8");
  const data = JSON.parse(raw) as {
    access_token: string;
    refresh_token: string;
    expires_at: number; // epoch seconds
  };

  const now = Math.floor(Date.now() / 1000);
  // Refresh if token expires in the next 5 minutes
  if (data.refresh_token && data.expires_at - now < 300) {
    console.log("Access token expiring soon – refreshing...");
    const newToken = await refreshVercelToken(data.refresh_token);

    // Adapt from ConnectTokenResponse to local store structure
    const updated = {
      access_token: (newToken as any).token || (newToken as any).access_token,
      refresh_token: (newToken as any).refresh_token ?? data.refresh_token,
      expires_at: (newToken as any).expiresAt
        ? Math.floor((newToken as any).expiresAt / 1000)
        : (now + ((newToken as any).expires_in || 3600)),
    };

    fs.writeFileSync(storePath, JSON.stringify(updated, null, 2));
    console.log("Token refreshed and stored.");
  } else {
    console.log("Access token still valid; no refresh needed.");
  }
}

refreshIfNeeded().catch((err) => {
  console.error("Error during token refresh:", err);
});
