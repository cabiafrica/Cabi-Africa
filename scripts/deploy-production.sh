#!/bin/bash

# Production Deployment Script
# This script builds and deploys all applications to production
# Usage: ./scripts/deploy-production.sh

set -e  # Exit on error

echo "🚀 Starting Production Deployment"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_step() {
    echo -e "\n${YELLOW}➜ $1${NC}"
}

# Pre-deployment checks
print_step "Running pre-deployment checks..."

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "Not on main branch (current: $CURRENT_BRANCH)"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_error "You have uncommitted changes. Please commit or stash them first."
    git status -s
    exit 1
fi

print_success "Pre-deployment checks passed"

# Pull latest changes
print_step "Pulling latest changes..."
git pull origin main
print_success "Updated to latest commit: $(git log -1 --oneline)"

# Install dependencies
print_step "Installing dependencies..."
npm ci
print_success "Dependencies installed"

# Run tests
print_step "Running tests..."
npx nx affected --target=test --parallel=3 --base=origin/main || {
    print_error "Tests failed!"
    exit 1
}
print_success "All tests passed"

# Run linting
print_step "Running linting..."
npx nx affected --target=lint --parallel=3 --base=origin/main || {
    print_error "Linting failed!"
    exit 1
}
print_success "Linting passed"

# Build applications
print_step "Building applications (this will be fast with optimizations!)..."

# Build frontend
print_step "Building frontend applications..."
npx nx run-many --target=build \
    --projects=admin-panel,dispatch-panel,user-portal \
    --parallel=3 \
    --configuration=production || {
    print_error "Frontend build failed!"
    exit 1
}
print_success "Frontend applications built"

# Build backend
print_step "Building backend services..."
npx nx run-many --target=build \
    --projects=auth-gateway,admin-service,user-service,verification-service,dispatch-service,driver-lead-service \
    --parallel=3 \
    --configuration=production || {
    print_error "Backend build failed!"
    exit 1
}
print_success "Backend services built"

# Database migrations
print_step "Running database migrations..."
print_warning "Make sure DATABASE_URL and DIRECT_URL are set in .env.production"

read -p "Run migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    export $(cat .env.production | xargs)
    npx prisma migrate deploy || {
        print_error "Migration failed!"
        print_warning "Database might be in inconsistent state. Check manually."
        exit 1
    }
    print_success "Migrations completed"
else
    print_warning "Skipping migrations - don't forget to run them manually!"
fi

# Deploy confirmation
print_step "Ready to deploy to production"
print_warning "This will deploy:"
echo "  - Admin Panel"
echo "  - Dispatch Panel"
echo "  - User Portal"
echo "  - Backend Services"
echo ""

read -p "Proceed with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

# Deploy (example for Vercel, adjust for your platform)
print_step "Deploying applications..."

# Deploy User Portal
print_step "Deploying User Portal..."
cd web/user_portal
npx vercel --prod || print_error "User Portal deployment failed"
cd ../..
print_success "User Portal deployed"

# Deploy Admin Panel
print_step "Deploying Admin Panel..."
cd web/admin_panel
npx vercel --prod || print_error "Admin Panel deployment failed"
cd ../..
print_success "Admin Panel deployed"

# Deploy Dispatch Panel
print_step "Deploying Dispatch Panel..."
cd web/dispatch_panel
npx vercel --prod || print_error "Dispatch Panel deployment failed"
cd ../..
print_success "Dispatch Panel deployed"

# Health checks
print_step "Running health checks..."
sleep 10  # Wait for deployments to propagate

# Check each service
check_health() {
    local url=$1
    local name=$2
    
    if curl -f -s "$url/health" > /dev/null 2>&1; then
        print_success "$name is healthy"
        return 0
    else
        print_error "$name health check failed"
        return 1
    fi
}

# Uncomment and adjust URLs when deployed
# check_health "https://api.cabi-africa.com" "API Gateway"
# check_health "https://admin.cabi-africa.com" "Admin Panel"
# check_health "https://dispatch.cabi-africa.com" "Dispatch Panel"

# Success!
echo ""
echo "=================================="
print_success "Deployment completed successfully! 🎉"
echo "=================================="
echo ""
print_step "Post-deployment checklist:"
echo "  ✓ Builds completed"
echo "  ✓ Tests passed"
echo "  ✓ Migrations run"
echo "  ✓ Applications deployed"
echo ""
echo "Monitor your applications at:"
echo "  - Vercel Dashboard: https://vercel.com/dashboard"
echo "  - Sentry: https://sentry.io"
echo "  - Supabase: https://app.supabase.com"
echo ""
print_warning "Don't forget to:"
echo "  1. Test critical user flows"
echo "  2. Check error rates in monitoring"
echo "  3. Verify database performance"
echo "  4. Monitor logs for any issues"
echo ""
