import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Signer } from "@aws-sdk/rds-signer";
import { ClientBase, Pool, PoolConfig } from "pg";

let poolInstance: Pool | null = null;
let readOnlyPoolInstance: Pool | null = null;

// Telemetry counters
let totalQueriesExecuted = 0;
let totalReadReplicaQueries = 0;
let totalFailedQueries = 0;
let lastPoolHealthCheck = Date.now();

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

function createPoolConfig(host: string, port: number, user: string, database: string, signer: Signer | null, maxConnections: number): PoolConfig {
  return {
    host,
    user,
    database,
    password: () => (signer ? signer.getAuthToken() : Promise.resolve("")),
    port,
    ssl: { rejectUnauthorized: false },
    max: maxConnections,
    idleTimeoutMillis: POOL_CONFIG.idleTimeoutMillis,
    connectionTimeoutMillis: POOL_CONFIG.connectionTimeoutMillis,
    maxUses: POOL_CONFIG.maxUses,
    keepAlive: POOL_CONFIG.keepAlive,
    keepAliveInitialDelayMillis: POOL_CONFIG.keepAliveInitialDelayMillis,
    // Statement timeout to prevent runaway queries from blocking pool
    statement_timeout: POOL_CONFIG.statementTimeoutMillis,
  };
}

export function getDatabasePool(): Pool {
  if (!poolInstance) {
    const host = process.env.PGHOST || "dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com";
    const port = Number(process.env.PGPORT || 5432);
    const user = process.env.PGUSER || "postgres";
    const region = process.env.AWS_REGION || "us-east-1";
    const database = process.env.PGDATABASE || "postgres";
    const roleArn = process.env.AWS_ROLE_ARN || "arn:aws:iam::595710543826:role/Vercel/access-dcp-production-db";

    let signer: Signer | null = null;
    try {
      signer = new Signer({
        hostname: host,
        port,
        username: user,
        region,
        credentials: awsCredentialsProvider({
          roleArn,
          clientConfig: { region },
        }),
      });
    } catch (e) {
      console.warn("[Database] RDS Signer initialization warning:", e);
    }

    poolInstance = new Pool(
      createPoolConfig(host, port, user, database, signer, POOL_CONFIG.primaryMax)
    );

    poolInstance.on('error', (err) => {
      console.error('[Database Pool Error] Primary pool idle client error:', err.message);
      totalFailedQueries++;
    });

    try {
      attachDatabasePool(poolInstance);
    } catch (e) {
      console.warn("[Database] attachDatabasePool notice:", e);
    }
  }

  return poolInstance;
}

export function getReadOnlyDatabasePool(): Pool {
  if (!readOnlyPoolInstance) {
    const host = process.env.PGHOST_READ_ONLY || "dcp-production-db.cluster-ro-cs7wcksg2js1.us-east-1.rds.amazonaws.com";
    const port = Number(process.env.PGPORT || 5432);
    const user = process.env.PGUSER || "postgres";
    const region = process.env.AWS_REGION || "us-east-1";
    const database = process.env.PGDATABASE || "postgres";
    const roleArn = process.env.AWS_ROLE_ARN || "arn:aws:iam::595710543826:role/Vercel/access-dcp-production-db";

    let signer: Signer | null = null;
    try {
      signer = new Signer({
        hostname: host,
        port,
        username: user,
        region,
        credentials: awsCredentialsProvider({
          roleArn,
          clientConfig: { region },
        }),
      });
    } catch (e) {
      console.warn("[Database-RO] RDS Signer initialization warning:", e);
    }

    readOnlyPoolInstance = new Pool(
      createPoolConfig(host, port, user, database, signer, POOL_CONFIG.readOnlyMax)
    );

    readOnlyPoolInstance.on('error', (err) => {
      console.error('[Database Pool Error] Read-only pool idle client error:', err.message);
      totalFailedQueries++;
    });

    try {
      attachDatabasePool(readOnlyPoolInstance);
    } catch (e) {
      console.warn("[Database-RO] attachDatabasePool notice:", e);
    }
  }

  return readOnlyPoolInstance;
}

// Single query execution on primary cluster
export async function query(sql: string, args: unknown[] = []) {
  totalQueriesExecuted++;
  const pool = getDatabasePool();
  try {
    return await pool.query(sql, args);
  } catch (error) {
    totalFailedQueries++;
    throw error;
  }
}

// Single query execution on read-only cluster replica with fallback
export async function queryReadOnly(sql: string, args: unknown[] = []) {
  totalQueriesExecuted++;
  totalReadReplicaQueries++;
  try {
    const pool = getReadOnlyDatabasePool();
    return await pool.query(sql, args);
  } catch (roError) {
    console.warn('[Database-RO] Read-only replica query failed, falling back to primary:', roError);
    // Fallback to primary pool if read replica is unreachable
    const primaryPool = getDatabasePool();
    return await primaryPool.query(sql, args);
  }
}

// Transaction execution handler
export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const pool = getDatabasePool();
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

// Read/Write split query router: automatically routes SELECT queries to Read-Only replica
export async function smartQuery(sql: string, args: unknown[] = []) {
  const isSelect = /^\s*SELECT/i.test(sql);
  if (isSelect) {
    return queryReadOnly(sql, args);
  }
  return query(sql, args);
}

// Connection Pool Performance Metrics & Telemetry Exporter
export function getPoolMetrics() {
  const primary = poolInstance ? {
    totalCount: poolInstance.totalCount,
    idleCount: poolInstance.idleCount,
    waitingCount: poolInstance.waitingCount,
    maxCapacity: POOL_CONFIG.primaryMax,
    utilizationPct: poolInstance.totalCount > 0 
      ? Math.round(((poolInstance.totalCount - poolInstance.idleCount) / poolInstance.totalCount) * 100)
      : 0
  } : null;

  const readOnly = readOnlyPoolInstance ? {
    totalCount: readOnlyPoolInstance.totalCount,
    idleCount: readOnlyPoolInstance.idleCount,
    waitingCount: readOnlyPoolInstance.waitingCount,
    maxCapacity: POOL_CONFIG.readOnlyMax,
    utilizationPct: readOnlyPoolInstance.totalCount > 0
      ? Math.round(((readOnlyPoolInstance.totalCount - readOnlyPoolInstance.idleCount) / readOnlyPoolInstance.totalCount) * 100)
      : 0
  } : null;

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    primaryPool: primary || { status: 'uninitialized', maxCapacity: POOL_CONFIG.primaryMax },
    readOnlyReplicaPool: readOnly || { status: 'uninitialized', maxCapacity: POOL_CONFIG.readOnlyMax },
    performance: {
      totalQueriesExecuted,
      totalReadReplicaQueries,
      totalFailedQueries,
      replicaTrafficRatio: totalQueriesExecuted > 0 
        ? `${Math.round((totalReadReplicaQueries / totalQueriesExecuted) * 100)}%` 
        : '0%',
      idleTimeoutMs: POOL_CONFIG.idleTimeoutMillis,
      connectionTimeoutMs: POOL_CONFIG.connectionTimeoutMillis,
      statementTimeoutMs: POOL_CONFIG.statementTimeoutMillis,
      maxUsesLimit: POOL_CONFIG.maxUses,
      keepAliveEnabled: POOL_CONFIG.keepAlive,
    }
  };
}

// Graceful shutdown helper for container teardown or dev server reload
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
