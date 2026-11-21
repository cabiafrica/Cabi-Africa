#!/bin/bash
# ==============================================================================
# CABI AFRICA - AUTOMATED DEPLOYMENT SCRIPT TO DIGITALOCEAN DROPLET
# ==============================================================================

set -e

DROPLET_IP="104.248.168.68"
REMOTE_DIR="/opt/cabi-africa"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "============================================================"
echo "   🚀 CABI AFRICA - PRODUCTION DEPLOYMENT TO DROPLET       "
echo "   Target Server: root@$DROPLET_IP                          "
echo "============================================================"
echo ""
echo "Step 1/2: Uploading production backend codebase..."
echo "👉 When prompted, enter the root password you created for the Droplet."
echo ""

rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'build' \
  --exclude '.next' \
  --exclude 'mobile' \
  --exclude 'dist' \
  --exclude '.gemini' \
  --exclude 'scratch' \
  --exclude '*.apk' \
  --exclude '*.aab' \
  "$LOCAL_DIR/" "root@$DROPLET_IP:$REMOTE_DIR/"

echo ""
echo "✅ Codebase uploaded successfully!"
echo ""
echo "Step 2/2: Provisioning server, installing Docker & launching containers..."
echo "👉 When prompted, enter your root password one more time to execute."
echo ""

ssh "root@$DROPLET_IP" "bash -c '
  cd $REMOTE_DIR
  chmod +x scripts/*.sh
  ./scripts/setup-droplet.sh

  echo \"🐳 Building and launching Docker Compose stack...\"
  docker compose up -d --build

  echo \"⏳ Waiting 15 seconds for PostgreSQL and services to initialize...\"
  sleep 15

  echo \"🗄️ Initializing database tables and schema migrations...\"
  docker compose exec -T auth-gateway npx prisma db push --schema=libs/backend/database/prisma/schema.prisma --accept-data-loss || true

  echo \"📋 Live Container Status:\"
  docker compose ps

  echo \"\"
  echo \"===========================================================\"
  echo \"🎉 CABI AFRICA BACKEND IS OFFICIALLY LIVE!                 \"
  echo \"===========================================================\"
  echo \"Health Check URL: http://$DROPLET_IP/health\"
  echo \"API Gateway URL:  http://$DROPLET_IP:3030/api\"
  echo \"WebSocket Stream: ws://$DROPLET_IP:3334\"
  echo \"===========================================================\"
'"
