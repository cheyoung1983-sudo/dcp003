/**
 * AURORA IAM Connectivity Verification Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests connection to both Primary (Writer) and Read-Only (Replica) Aurora nodes
 * using the project's production database layer.
 *
 * Usage: npx tsx scripts/test-db.ts
 */

import * as dotenv from "dotenv";
import { getDatabasePool, getReadOnlyDatabasePool } from "../src/lib/serverDb";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function testNode(name: string, getPool: () => any) {
  console.log(`\n--- Testing ${name} Node ---`);
  const pool = getPool();
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT version(), NOW() as time');
    console.log(`✅ ${name} Nominal`);
    console.log(`   Version: ${res.rows[0].version.split(',')[0]}`);
    console.log(`   Server Time: ${res.rows[0].time}`);
    client.release();
  } catch (error: any) {
    console.error(`❌ ${name} Failure:`, error.message);
  } finally {
    // We don't call pool.end() here because it's a singleton pool in serverDb.ts
  }
}

async function main() {
  console.log("🚀 Starting Aurora Connectivity Probe...");
  console.log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`   User  : ${process.env.PGUSER || 'postgres'}`);

  await testNode("PRIMARY (Writer)", getDatabasePool);
  await testNode("READ-ONLY (Replica)", getReadOnlyDatabasePool);

  console.log("\nProbe Complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
