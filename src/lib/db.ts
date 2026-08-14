import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Signer } from "@aws-sdk/rds-signer";
import type { SignerConfig } from "@aws-sdk/rds-signer";
import { ClientBase, Pool, PoolConfig } from "pg";

let poolInstance: Pool | null = null;
let readOnlyPoolInstance: Pool | null = null;

// Telemetry counters
let totalQueriesExecuted = 0;
let totalReadReplicaQueries = 0;
let totalFailedQueries = 0;

// Connection pool configuration parameters
export const POOL_CONFIG = {
  primaryMax: Number(process.env.PG_MAX_POOL || 25),
  readOnlyMax: Number(process.env.PG_RO_MAX_POOL || 35),
  idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 3500),
  statementTimeoutMillis: Number(process.env.PG_STATEMENT_TIMEOUT_MS || 5000),
  maxUses: Number(process.env.PG_MAX_USES || 7500),
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

function createPoolConfig(
  host: string,
  port: number,
  user: string,
  database: string,
  signer: Signer | null,
  maxConnections: number
): PoolConfig {
  return {
    host,
    user,
    database,
    password: () => (signer ? signer.getAuthToken().catch(() => "") : Promise.resolve("")),
    port,
    ssl: { rejectUnauthorized: false },
    max: maxConnections,
    idleTimeoutMillis: POOL_CONFIG.idleTimeoutMillis,
    connectionTimeoutMillis: POOL_CONFIG.connectionTimeoutMillis,
    maxUses: POOL_CONFIG.maxUses,
    keepAlive: POOL_CONFIG.keepAlive,
    keepAliveInitialDelayMillis: POOL_CONFIG.keepAliveInitialDelayMillis,
    statement_timeout: POOL_CONFIG.statementTimeoutMillis,
  };
}

export function isDbConfigured(): boolean {
  return !!(process.env.PGHOST && process.env.PGUSER);
}

export function getDatabasePool(): Pool | null {
  if (!poolInstance) {
    if (!process.env.PGHOST) {
      return null;
    }
    const host = process.env.PGHOST;
    const port = Number(process.env.PGPORT || 5432);
    const user = process.env.PGUSER || "postgres";
    const region = process.env.AWS_REGION || "us-east-1";
    const database = process.env.PGDATABASE || "postgres";
    const roleArn = process.env.AWS_ROLE_ARN;

    let signer: Signer | null = null;
    try {
      const signerOptions: SignerConfig = {
        hostname: host,
        port,
        username: user,
        region,
      };

      if (process.env.VERCEL && roleArn) {
        signerOptions.credentials = awsCredentialsProvider({
          roleArn,
          clientConfig: { region },
        });
      }

      signer = new Signer(signerOptions);
    } catch (e) {
      console.warn("[Database] RDS Signer initialization warning:", e);
    }

    try {
      poolInstance = new Pool(
        createPoolConfig(host, port, user, database, signer, POOL_CONFIG.primaryMax)
      );

      poolInstance.on("error", (err) => {
        console.error("[Database Pool Error] Primary pool idle client error:", err.message);
        totalFailedQueries++;
      });

      attachDatabasePool(poolInstance);
    } catch (err) {
      console.warn("[Database] Primary pool creation failed:", err);
      return null;
    }
  }

  return poolInstance;
}

export function getReadOnlyDatabasePool(): Pool | null {
  if (!readOnlyPoolInstance) {
    const host = process.env.PGHOST_READ_ONLY || process.env.PGHOST;
    if (!host) {
      return null;
    }
    const port = Number(process.env.PGPORT || 5432);
    const user = process.env.PGUSER || "postgres";
    const region = process.env.AWS_REGION || "us-east-1";
    const database = process.env.PGDATABASE || "postgres";
    const roleArn = process.env.AWS_ROLE_ARN;

    let signer: Signer | null = null;
    try {
      const signerOptions: SignerConfig = {
        hostname: host,
        port,
        username: user,
        region,
      };

      if (process.env.VERCEL && roleArn) {
        signerOptions.credentials = awsCredentialsProvider({
          roleArn,
          clientConfig: { region },
        });
      }

      signer = new Signer(signerOptions);
    } catch (e) {
      console.warn("[Database-RO] RDS Signer initialization warning:", e);
    }

    try {
      readOnlyPoolInstance = new Pool(
        createPoolConfig(host, port, user, database, signer, POOL_CONFIG.readOnlyMax)
      );

      readOnlyPoolInstance.on("error", (err) => {
        console.error("[Database Pool Error] Read-only pool idle client error:", err.message);
        totalFailedQueries++;
      });

      attachDatabasePool(readOnlyPoolInstance);
    } catch (err) {
      console.warn("[Database-RO] Read-only pool creation failed:", err);
      return null;
    }
  }

  return readOnlyPoolInstance;
}

export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    const p = getDatabasePool();
    if (!p) {
      if (prop === "query") {
        return async () => ({ rows: [] });
      }
      return () => {};
    }
    const val = (p as any)[prop];
    if (typeof val === "function") {
      return val.bind(p);
    }
    return val;
  },
});

// Single query execution on primary cluster with fallback
export async function query(sql: string, args: unknown[] = []): Promise<any> {
  totalQueriesExecuted++;
  try {
    const p = getDatabasePool();
    if (!p) {
      console.warn("[Database] Database not configured — returning mock empty result");
      return { rows: [] };
    }
    return await p.query(sql, args);
  } catch (err) {
    totalFailedQueries++;
    console.warn("[Database] Database query failed:", err);
    return { rows: [] };
  }
}

// Single query execution on read-only cluster replica with fallback
export async function queryReadOnly(sql: string, args: unknown[] = []): Promise<any> {
  totalQueriesExecuted++;
  totalReadReplicaQueries++;
  try {
    const p = getReadOnlyDatabasePool() || getDatabasePool();
    if (!p) {
      return { rows: [] };
    }
    return await p.query(sql, args);
  } catch (roError) {
    console.warn("[Database-RO] Read-only replica query failed, falling back to primary:", roError);
    const primaryPool = getDatabasePool();
    if (!primaryPool) return { rows: [] };
    return await primaryPool.query(sql, args);
  }
}

// Read/Write split query router
export async function smartQuery(sql: string, args: unknown[] = []): Promise<any> {
  const isSelect = /^\s*SELECT/i.test(sql);
  if (isSelect) {
    return queryReadOnly(sql, args);
  }
  return query(sql, args);
}

// Transaction execution handler
export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>
): Promise<T> {
  const p = getDatabasePool();
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

// Connection Pool Performance Metrics & Telemetry Exporter
export function getPoolMetrics() {
  const primary = poolInstance
    ? {
        totalCount: poolInstance.totalCount,
        idleCount: poolInstance.idleCount,
        waitingCount: poolInstance.waitingCount,
        maxCapacity: POOL_CONFIG.primaryMax,
        utilizationPct:
          poolInstance.totalCount > 0
            ? Math.round(
                ((poolInstance.totalCount - poolInstance.idleCount) /
                  poolInstance.totalCount) *
                  100
              )
            : 0,
      }
    : null;

  const readOnly = readOnlyPoolInstance
    ? {
        totalCount: readOnlyPoolInstance.totalCount,
        idleCount: readOnlyPoolInstance.idleCount,
        waitingCount: readOnlyPoolInstance.waitingCount,
        maxCapacity: POOL_CONFIG.readOnlyMax,
        utilizationPct:
          readOnlyPoolInstance.totalCount > 0
            ? Math.round(
                ((readOnlyPoolInstance.totalCount - readOnlyPoolInstance.idleCount) /
                  readOnlyPoolInstance.totalCount) *
                  100
              )
            : 0,
      }
    : null;

  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    primaryPool: primary || {
      status: "uninitialized",
      maxCapacity: POOL_CONFIG.primaryMax,
    },
    readOnlyReplicaPool: readOnly || {
      status: "uninitialized",
      maxCapacity: POOL_CONFIG.readOnlyMax,
    },
    performance: {
      totalQueriesExecuted,
      totalReadReplicaQueries,
      totalFailedQueries,
      replicaTrafficRatio:
        totalQueriesExecuted > 0
          ? `${Math.round((totalReadReplicaQueries / totalQueriesExecuted) * 100)}%`
          : "0%",
      idleTimeoutMs: POOL_CONFIG.idleTimeoutMillis,
      connectionTimeoutMs: POOL_CONFIG.connectionTimeoutMillis,
      statementTimeoutMs: POOL_CONFIG.statementTimeoutMillis,
      maxUsesLimit: POOL_CONFIG.maxUses,
      keepAliveEnabled: POOL_CONFIG.keepAlive,
    },
  };
}

// Graceful shutdown helper
export async function closePools(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
  if (readOnlyPoolInstance) {
    await readOnlyPoolInstance.end();
    readOnlyPoolInstance = null;
  }
}
