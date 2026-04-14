#!/bin/sh

# CABI AFRICA - Unified Service Startup Script
# This script handles the path differences between root-level and backend sub-services

echo "🚀 Starting service: ${SERVICE_NAME}"
echo "📂 Working directory: $(pwd)"
echo "🔍 IS_BACKEND_SUB_SERVICE: ${IS_BACKEND_SUB_SERVICE}"

if [ "$IS_BACKEND_SUB_SERVICE" = "true" ]; then
    TARGET_PATH="dist/backend/${SERVICE_NAME}/main.js"
else
    TARGET_PATH="dist/${SERVICE_NAME}/main.js"
fi

echo "🎯 Targeted path: ${TARGET_PATH}"

if [ -f "$TARGET_PATH" ]; then
    echo "✅ Found main.js. Launching..."
    exec node "$TARGET_PATH"
else
    echo "❌ ERROR: Cannot find ${TARGET_PATH}"
    echo "📂 Listing available build outputs in dist/:"
    ls -R dist
    exit 1
fi
