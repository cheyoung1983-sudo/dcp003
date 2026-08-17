import { query } from '../src/lib/serverDb';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

async function testConnection() {
  console.log('--- RDS Connection Test (Production Layer) ---');

  try {
    console.log('\nExecuting query via production pool...');
    const res = await query('SELECT version(), current_database(), current_user');
    console.log('✓ Connected successfully!');

    console.log('\nDatabase Info:');
    console.table(res.rows[0]);
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Connection Failed:');
    console.error(error.message);

    if (error.message.includes('PAM authentication failed')) {
      console.log('\nTIP: "PAM authentication failed" usually means the RDS user is not set up for IAM auth.');
      console.log('To fix this, connect to your database with a regular password and run:');
      console.log(`   GRANT rds_iam TO ${process.env.PGUSER || 'postgres'};`);
    }
    process.exit(1);
  }
}

testConnection();
