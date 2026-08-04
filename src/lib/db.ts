import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Signer } from "@aws-sdk/rds-signer";
import type { SignerConfig } from "@aws-sdk/rds-signer";
import { ClientBase, Pool } from "pg";

let poolInstance: Pool | null = null;

function getPool(): Pool | null {
  if (!poolInstance) {
    if (!process.env.PGHOST) {
      return null;
    }
    try {
      const signerOptions: SignerConfig = {
        hostname: process.env.PGHOST || '',
        port: Number(process.env.PGPORT) || 5432,
        username: process.env.PGUSER || '',
        region: process.env.AWS_REGION || "us-east-1",
      };

      if (process.env.VERCEL && process.env.AWS_ROLE_ARN) {
        signerOptions.credentials = awsCredentialsProvider({
          roleArn: process.env.AWS_ROLE_ARN,
          clientConfig: { region: process.env.AWS_REGION || "us-east-1" },
        });
      }

      const signer = new Signer(signerOptions);

      poolInstance = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE || "postgres",
        password: () => signer.getAuthToken().catch(() => ''),
        port: Number(process.env.PGPORT) || 5432,
        ssl: { rejectUnauthorized: false },
        max: 20,
        connectionTimeoutMillis: 3000,
      });
      attachDatabasePool(poolInstance);
    } catch (err) {
      console.warn("[AI Studio] Database pool initialization failed:", err);
      return null;
    }
  }
  return poolInstance;
}

export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    const p = getPool();
    if (!p) {
      if (prop === 'query') {
        return async () => ({ rows: [] });
      }
      return () => {};
    }
    const val = (p as any)[prop];
    if (typeof val === 'function') {
      return val.bind(p);
    }
    return val;
  }
});

// Single query transaction with fallback
export async function query(sql: string, args: unknown[] = []): Promise<any> {
  try {
    const p = getPool();
    if (!p) {
      console.warn('[AI Studio] Database not configured — returning mock empty result');
      return { rows: [] };
    }
    return await p.query(sql, args);
  } catch (err) {
    console.warn('[AI Studio] Database query failed — returning mock response:', err);
    return { rows: [] };
  }
}

// Use it for multiple queries transaction
export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const p = getPool();
  if (!p) {
    throw new Error("Database not configured");
  }
  const client = await p.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Safe helper to check if database configuration is complete.
 */
export function isDbConfigured(): boolean {
  return !!(process.env.PGHOST && process.env.PGUSER);
}
