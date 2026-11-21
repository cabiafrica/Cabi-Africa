#!/bin/bash
# ==============================================================================
# CABI AFRICA - DIGITALOCEAN DROPLET AUTOMATED SETUP SCRIPT
# Domain: cabi.africa / www.cabi.africa
# Server: Ubuntu 24.04 LTS (104.248.168.68)
# ==============================================================================

set -e

echo "============================================================"
echo "   🚀 CABI AFRICA PRODUCTION SERVER PROVISIONING            "
echo "============================================================"

# 1. System Updates & Dependencies
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y
apt-get install -y curl git ufw ca-certificates gnupg lsb-release

# 2. Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "✅ Docker installed successfully."
else
    echo "✅ Docker is already installed."
fi

# 3. Configure Firewall (UFW)
echo "🔒 Configuring Firewall rules..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP (Caddy SSL challenge)'
ufw allow 443/tcp comment 'HTTPS (Caddy Auto-SSL)'
ufw allow 443/udp comment 'HTTP/3 (QUIC)'
ufw --force enable
echo "✅ Firewall active and secured."

# 4. Create App Directory
APP_DIR="/opt/cabi-africa"
echo "📂 Setting up Application Directory at $APP_DIR..."
mkdir -p $APP_DIR
cd $APP_DIR

# 5. Production Environment Variables
if [ ! -f .env ]; then
    echo "🔑 Generating secure production .env configuration..."
    JWT_SEC=$(openssl rand -hex 32)
    DB_PASS=$(openssl rand -hex 16)
    
    cat <<EOF > .env
NODE_ENV=production
POSTGRES_USER=cabi_user
POSTGRES_PASSWORD=${DB_PASS}
POSTGRES_DB=cabi_africa
DATABASE_URL=postgresql://cabi_user:${DB_PASS}@postgres:5432/cabi_africa?schema=public
REDIS_URL=redis://redis:6379
JWT_SECRET=${JWT_SEC}
JWT_EXPIRATION=24h
PORT=3030
EOF
    echo "✅ Production .env generated with secure credentials."
fi

echo "============================================================"
echo "🎉 SERVER BASE SETUP COMPLETE!"
echo "Next: Deploy Cabi Africa containers using: docker compose up -d --build"
echo "============================================================"
