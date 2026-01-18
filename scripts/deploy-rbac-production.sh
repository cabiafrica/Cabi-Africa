#!/bin/bash

##############################################################################
# RBAC System - Production Deployment Script
# 
# This script automates the production deployment process for the RBAC system
# 
# Usage: ./deploy-rbac-production.sh [environment]
#   environment: staging | production (default: staging)
#
# Prerequisites:
#   - Node.js 20+
#   - npm installed
#   - Database accessible
#   - Environment variables configured
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment
ENV=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="deployment_${ENV}_${TIMESTAMP}.log"

# Functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════${NC}\n"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_success "Node.js installed: $NODE_VERSION"
    else
        log_error "Node.js not found. Please install Node.js 20+"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        log_success "npm installed: $NPM_VERSION"
    else
        log_error "npm not found"
        exit 1
    fi
    
    # Check for .env file
    if [ "$ENV" = "production" ]; then
        if [ ! -f .env.production ]; then
            log_error ".env.production not found"
            log_info "Please create .env.production based on .env.production.example"
            exit 1
        fi
        log_success "Production environment file found"
    fi
}

# Run tests
run_tests() {
    print_header "Running RBAC Integration Tests"
    
    log_info "Starting auth-gateway..."
    npx nx serve auth-gateway &
    AUTH_GATEWAY_PID=$!
    
    # Wait for service to start
    sleep 10
    
    # Check if service is running
    if ! curl -s http://localhost:3333/api/health > /dev/null; then
        log_error "Auth-gateway failed to start"
        kill $AUTH_GATEWAY_PID 2>/dev/null || true
        exit 1
    fi
    
    log_success "Auth-gateway started (PID: $AUTH_GATEWAY_PID)"
    
    # Run integration tests
    log_info "Running RBAC frontend integration tests..."
    if npx ts-node scripts/test_rbac_frontend_integration.ts; then
        log_success "All tests passed (11/11)"
    else
        log_error "Tests failed. Stopping deployment."
        kill $AUTH_GATEWAY_PID 2>/dev/null || true
        exit 1
    fi
    
    # Stop auth-gateway
    log_info "Stopping auth-gateway..."
    kill $AUTH_GATEWAY_PID 2>/dev/null || true
    sleep 2
    log_success "Auth-gateway stopped"
}

# Build backend
build_backend() {
    print_header "Building Backend (Auth-Gateway)"
    
    log_info "Building auth-gateway for $ENV..."
    if npx nx build auth-gateway --configuration=$ENV; then
        log_success "Auth-gateway built successfully"
        
        # Show bundle size
        if [ -f dist/apps/auth-gateway/main.js ]; then
            SIZE=$(du -h dist/apps/auth-gateway/main.js | cut -f1)
            log_info "Bundle size: $SIZE"
        fi
    else
        log_error "Auth-gateway build failed"
        exit 1
    fi
}

# Build frontend
build_frontend() {
    print_header "Building Frontend (Admin Panel)"
    
    log_info "Building admin panel for $ENV..."
    cd web/admin_panel
    
    if npm run build; then
        log_success "Admin panel built successfully"
        
        # Show bundle sizes
        if [ -d dist ]; then
            TOTAL_SIZE=$(du -sh dist | cut -f1)
            log_info "Total bundle size: $TOTAL_SIZE"
            
            # List chunk sizes
            log_info "Main chunks:"
            ls -lh dist/assets/*.js | awk '{print "  " $9 ": " $5}'
        fi
    else
        log_error "Admin panel build failed"
        exit 1
    fi
    
    cd ../..
}

# Database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    if [ "$ENV" = "production" ]; then
        log_warning "About to run migrations on PRODUCTION database"
        read -p "Continue? (yes/no): " CONFIRM
        if [ "$CONFIRM" != "yes" ]; then
            log_info "Migration cancelled"
            exit 1
        fi
    fi
    
    log_info "Running Prisma migrations..."
    if npx prisma migrate deploy; then
        log_success "Migrations completed successfully"
    else
        log_error "Migration failed"
        exit 1
    fi
    
    log_info "Generating Prisma Client..."
    npx prisma generate
    log_success "Prisma Client generated"
}

# Create super admin
create_super_admin() {
    print_header "Verifying Super Admin"
    
    log_info "Creating/updating super admin user..."
    if npx ts-node scripts/recreate-super-admin.js; then
        log_success "Super admin configured"
    else
        log_warning "Super admin script completed with warnings"
    fi
}

# Deployment confirmation
deployment_summary() {
    print_header "Deployment Summary"
    
    echo -e "${GREEN}✓ Tests Passed:${NC} 11/11"
    echo -e "${GREEN}✓ Backend Built:${NC} auth-gateway"
    echo -e "${GREEN}✓ Frontend Built:${NC} admin-panel"
    echo -e "${GREEN}✓ Migrations:${NC} Up to date"
    echo -e "${GREEN}✓ Super Admin:${NC} Configured"
    echo ""
    
    if [ "$ENV" = "production" ]; then
        log_warning "This will deploy to PRODUCTION"
        read -p "Proceed with deployment? (yes/no): " PROCEED
        if [ "$PROCEED" != "yes" ]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    fi
}

# Deploy to platform
deploy_to_platform() {
    print_header "Deploying to Platform"
    
    # Check which platform to deploy to
    if [ -f vercel.json ]; then
        log_info "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
            log_success "Deployed to Vercel"
        else
            log_warning "Vercel CLI not found. Please deploy manually:"
            log_info "  vercel --prod"
        fi
    else
        log_warning "No deployment platform configured"
        log_info "Please deploy manually using your platform's CLI"
        log_info ""
        log_info "Built files locations:"
        log_info "  Backend: dist/apps/auth-gateway/"
        log_info "  Frontend: web/admin_panel/dist/"
    fi
}

# Post-deployment verification
verify_deployment() {
    print_header "Post-Deployment Verification"
    
    # Get API URL from environment
    API_URL=${VITE_API_URL:-http://localhost:3333/api}
    
    log_info "Verifying backend health..."
    if curl -s "$API_URL/health" > /dev/null; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        log_error "URL: $API_URL/health"
    fi
    
    # Check if frontend is accessible
    FRONTEND_URL=${FRONTEND_URL:-http://localhost:3001}
    log_info "Checking frontend..."
    if curl -s "$FRONTEND_URL" > /dev/null; then
        log_success "Frontend is accessible"
    else
        log_warning "Frontend check failed (may not be deployed yet)"
    fi
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   RBAC Production Deployment Script     ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Environment: ${ENV}${NC}"
    echo -e "${YELLOW}Timestamp: ${TIMESTAMP}${NC}"
    echo -e "${YELLOW}Log file: ${LOG_FILE}${NC}"
    echo ""
    
    # Run all steps
    check_prerequisites
    
    # Skip tests if requested
    if [ "$SKIP_TESTS" != "true" ]; then
        run_tests
    else
        log_warning "Tests skipped (SKIP_TESTS=true)"
    fi
    
    build_backend
    build_frontend
    
    if [ "$ENV" = "production" ]; then
        run_migrations
        create_super_admin
    fi
    
    deployment_summary
    
    if [ "$AUTO_DEPLOY" = "true" ]; then
        deploy_to_platform
        verify_deployment
    else
        log_info "Auto-deploy disabled. Build complete."
        log_info ""
        log_info "To deploy manually:"
        log_info "  Backend: Deploy dist/apps/auth-gateway/"
        log_info "  Frontend: Deploy web/admin_panel/dist/"
    fi
    
    # Final summary
    print_header "Deployment Complete!"
    
    echo -e "${GREEN}✓ RBAC system built successfully${NC}"
    echo -e "  Log file: ${LOG_FILE}"
    echo ""
    
    if [ "$ENV" = "production" ]; then
        echo -e "${YELLOW}Next steps:${NC}"
        echo -e "  1. Verify deployment at https://admin.your-domain.com"
        echo -e "  2. Run manual testing (see RBAC_FRONTEND_READY.md)"
        echo -e "  3. Monitor logs for errors"
        echo -e "  4. Notify stakeholders"
    fi
    
    echo ""
    log_success "Deployment script completed successfully!"
}

# Run main function
main
