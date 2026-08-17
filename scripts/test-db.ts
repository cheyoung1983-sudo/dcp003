/**
 * AURORA IAM Connectivity Verification Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests connection to both Primary (Writer) and Read-Only (Replica) Aurora nodes
 * using the project's production database layer.
 *
 * Usage: npx tsx scripts/test-db.ts
 */

import 'dotenv/config';
import { getDatabasePool, getReadOnlyDatabasePool } from "../src/lib/serverDb";

async function testNode(name: string, getPool: () => any) {
  console.log(`\n--- Testing ${name} Node ---`);
  try {
    const pool = getPool();
    const client = await pool.connect();
    const res = await client.query('SELECT version(), NOW() as time');
    console.log(`✅ ${name} Nominal`);
    console.log(`   Version: ${res.rows[0].version.split(',')[0]}`);
    console.log(`   Server Time: ${res.rows[0].time}`);
    client.release();
  } catch (error: any) {
    console.error(`❌ ${name} Failure:`, error.message);
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
