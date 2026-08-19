#!/bin/bash
# ==============================================================================
# Pre-Build Verification & Dependency Update Script
# Display & Cell Pros LLC (D&CP)
# ==============================================================================

set -e

echo "=================================================="
echo " [1/3] Updating & Installing NPM Dependencies..."
echo "=================================================="
npm install

echo ""
echo "=================================================="
echo " [2/3] Checking for Missing Code & Type Integrity..."
echo "=================================================="
npx tsc --noEmit

echo ""
echo "=================================================="
echo " [3/3] Running Production Build Verification..."
echo "=================================================="
npm run build

echo ""
echo "=================================================="
echo " ✅ All dependency checks, type validations, and builds passed successfully!"
echo "=================================================="
