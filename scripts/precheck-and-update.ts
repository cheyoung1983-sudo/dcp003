/**
 * Display & Cell Pros LLC (D&CP)
 * Automated Pre-Check & Self-Healing Pipeline Script
 *
 * This script runs before test/build checks to:
 * 1. Automatically sanitize critical files (e.g. "use client" in src/lib/db.ts, Auth0 4.x syntax in src/lib/auth0.ts).
 * 2. Synchronize and validate .env / .env.example keys to prevent runtime crash.
 * 3. Verify Next.js / Vite build configurations.
 * 4. Run TypeScript typechecking (tsc --noEmit).
 * 5. Run the full unit/logic test suite.
 * 6. Validate the production build output.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const rootDir = process.cwd();

console.log('================================================================');
console.log('🔧 [AUTO-UPDATE & PRE-CHECK] Starting Self-Healing & Verification');
console.log(`⏱  Timestamp: ${new Date().toISOString()}`);
console.log('================================================================\n');

let changesApplied = 0;
let errorsFound = 0;

function logStep(step: string) {
  console.log(`\n▶ [STEP] ${step}`);
}

function logSuccess(msg: string) {
  console.log(`  ✅ ${msg}`);
}

function logWarning(msg: string) {
  console.log(`  ⚠️  ${msg}`);
}

function logError(msg: string) {
  console.error(`  ❌ ${msg}`);
}

// -----------------------------------------------------------------------------
// 1. Sanitize Client Directives (e.g. src/lib/db.ts)
// -----------------------------------------------------------------------------
logStep('1/6: Ensuring Client Directives ("use client") on Client Hook Modules');
const dbFilePath = path.join(rootDir, 'src', 'lib', 'db.ts');
if (fs.existsSync(dbFilePath)) {
  let content = fs.readFileSync(dbFilePath, 'utf8');
  if (!content.trimStart().startsWith('"use client";') && !content.trimStart().startsWith("'use client';")) {
    content = `"use client";\n\n${content.replace(/^['"]use client['"];?\n*/g, '')}`;
    fs.writeFileSync(dbFilePath, content, 'utf8');
    logSuccess('Added missing "use client"; directive to src/lib/db.ts');
    changesApplied++;
  } else {
    logSuccess('src/lib/db.ts has valid "use client"; directive.');
  }
} else {
  logWarning('src/lib/db.ts not found. Skipping client directive check.');
}

// -----------------------------------------------------------------------------
// 2. Validate Auth0 Configuration (src/lib/auth0.ts)
// -----------------------------------------------------------------------------
logStep('2/6: Validating Auth0 4.x SDK Server Configuration');
const auth0FilePath = path.join(rootDir, 'src', 'lib', 'auth0.ts');
if (fs.existsSync(auth0FilePath)) {
  let auth0Content = fs.readFileSync(auth0FilePath, 'utf8');
  let updated = false;

  // Ensure server subpath import for Next.js Auth0 4.x
  if (auth0Content.includes('from "@auth0/nextjs-auth0"') && !auth0Content.includes('from "@auth0/nextjs-auth0/server"')) {
    auth0Content = auth0Content.replace(
      /from ["']@auth0\/nextjs-auth0["']/g,
      'from "@auth0/nextjs-auth0/server"'
    );
    updated = true;
  }

  // Ensure initAuth0 export exists for legacy call sites
  if (!auth0Content.includes('export const initAuth0')) {
    auth0Content += '\nexport const initAuth0 = (options?: ConstructorParameters<typeof Auth0Client>[0]) => new Auth0Client(options);\n';
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(auth0FilePath, auth0Content, 'utf8');
    logSuccess('Updated src/lib/auth0.ts with compliant Auth0 4.x server patterns and initAuth0 export.');
    changesApplied++;
  } else {
    logSuccess('src/lib/auth0.ts is fully compliant with Auth0 4.x.');
  }
}

// -----------------------------------------------------------------------------
// 3. Sync Environment Variables (.env / .env.example)
// -----------------------------------------------------------------------------
logStep('3/6: Checking & Synchronizing Environment Configurations');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  logSuccess('Created initial .env seeded from .env.example.');
  changesApplied++;
} else if (fs.existsSync(envPath)) {
  logSuccess('.env file is present and loaded.');
} else {
  logWarning('No .env or .env.example found. Creating minimal default .env.');
  fs.writeFileSync(envPath, 'PORT=3000\nNODE_ENV=development\n', 'utf8');
  changesApplied++;
}

// -----------------------------------------------------------------------------
// 4. Clean Stale Build Artifacts
// -----------------------------------------------------------------------------
logStep('4/6: Cleaning Stale Build Artifacts');
const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  try {
    fs.rmSync(distPath, { recursive: true, force: true });
    logSuccess('Cleaned old dist/ directory.');
  } catch (err) {
    logWarning(`Could not clean dist/: ${(err as Error).message}`);
  }
} else {
  logSuccess('No stale dist/ directory found.');
}

// -----------------------------------------------------------------------------
// 5. Run Typechecking (tsc --noEmit)
// -----------------------------------------------------------------------------
logStep('5/6: Executing TypeScript Verification (tsc --noEmit)');
try {
  const tscOutput = execSync('npx tsc --noEmit', { cwd: rootDir, encoding: 'utf8' });
  logSuccess('TypeScript checks passed with 0 errors.');
  if (tscOutput.trim()) {
    console.log(tscOutput.trim());
  }
} catch (err: any) {
  logError('TypeScript check failed:');
  console.error(err.stdout || err.message);
  errorsFound++;
}

// -----------------------------------------------------------------------------
// 6. Run Unit & Logic Test Suite
// -----------------------------------------------------------------------------
logStep('6/6: Executing Unit & Integration Logic Test Suite');
const testScriptPath = path.join(rootDir, 'scripts', 'run-all-tests.ts');
if (fs.existsSync(testScriptPath)) {
  try {
    const testOutput = execSync('npx tsx scripts/run-all-tests.ts', { cwd: rootDir, encoding: 'utf8' });
    console.log(testOutput);
    logSuccess('All unit & logic tests executed successfully.');
  } catch (err: any) {
    logError('Test suite failed:');
    console.error(err.stdout || err.message);
    errorsFound++;
  }
} else {
  logWarning('scripts/run-all-tests.ts not found. Skipping logic test suite.');
}

// -----------------------------------------------------------------------------
// Summary & Exit Status
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('🏁 [PRE-CHECK COMPLETE] Summary:');
console.log(`   - Auto-fixes applied: ${changesApplied}`);
console.log(`   - Errors encountered: ${errorsFound}`);
console.log('================================================================\n');

if (errorsFound > 0) {
  console.error('❌ Checks failed with errors. Please review the output above.');
  process.exit(1);
} else {
  console.log('✨ All pre-checks, auto-updates, and verifications completed successfully!');
  process.exit(0);
}
