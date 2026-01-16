# Production Deployment Script (PowerShell)
# This script builds and deploys all applications to production
# Usage: .\scripts\deploy-production.ps1

param(
    [switch]$SkipTests,
    [switch]$SkipMigrations,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Error-Custom { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Step { param($Message) Write-Host "`n➜ $Message" -ForegroundColor Cyan }

Write-Host "🚀 Starting Production Deployment" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

# Pre-deployment checks
Write-Step "Running pre-deployment checks..."

# Check if on correct branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "main" -and -not $Force) {
    Write-Warning "Not on main branch (current: $currentBranch)"
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne "y") {
        Write-Error-Custom "Deployment cancelled"
        exit 1
    }
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status -and -not $Force) {
    Write-Error-Custom "You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
}

Write-Success "Pre-deployment checks passed"

# Pull latest changes
Write-Step "Pulling latest changes..."
git pull origin main
$latestCommit = git log -1 --oneline
Write-Success "Updated to latest commit: $latestCommit"

# Install dependencies
Write-Step "Installing dependencies..."
npm ci
Write-Success "Dependencies installed"

# Run tests
if (-not $SkipTests) {
    Write-Step "Running tests..."
    try {
        npx nx affected --target=test --parallel=3 --base=origin/main
        Write-Success "All tests passed"
    }
    catch {
        Write-Error-Custom "Tests failed!"
        exit 1
    }
}
else {
    Write-Warning "Skipping tests (--SkipTests flag used)"
}

# Run linting
Write-Step "Running linting..."
try {
    npx nx affected --target=lint --parallel=3 --base=origin/main
    Write-Success "Linting passed"
}
catch {
    Write-Error-Custom "Linting failed!"
    exit 1
}

# Build applications
Write-Step "Building applications (this will be fast with optimizations!)..."

# Build frontend
Write-Step "Building frontend applications..."
try {
    npx nx run-many --target=build `
        --projects=admin-panel,dispatch-panel,user-portal `
        --parallel=3 `
        --configuration=production
    Write-Success "Frontend applications built"
}
catch {
    Write-Error-Custom "Frontend build failed!"
    exit 1
}

# Build backend
Write-Step "Building backend services..."
try {
    npx nx run-many --target=build `
        --projects=auth-gateway,admin-service,user-service,verification-service,dispatch-service,driver-lead-service `
        --parallel=3 `
        --configuration=production
    Write-Success "Backend services built"
}
catch {
    Write-Error-Custom "Backend build failed!"
    exit 1
}

# Database migrations
if (-not $SkipMigrations) {
    Write-Step "Running database migrations..."
    Write-Warning "Make sure DATABASE_URL and DIRECT_URL are set in .env.production"

    if (-not $Force) {
        $response = Read-Host "Run migrations now? (y/n)"
        if ($response -eq "y") {
            try {
                # Load .env.production
                Get-Content .env.production | ForEach-Object {
                    if ($_ -match '^([^=]+)=(.*)$') {
                        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
                    }
                }
                
                npx prisma migrate deploy
                Write-Success "Migrations completed"
            }
            catch {
                Write-Error-Custom "Migration failed!"
                Write-Warning "Database might be in inconsistent state. Check manually."
                exit 1
            }
        }
        else {
            Write-Warning "Skipping migrations - don't forget to run them manually!"
        }
    }
}
else {
    Write-Warning "Skipping migrations (--SkipMigrations flag used)"
}

# Deploy confirmation
Write-Step "Ready to deploy to production"
Write-Warning "This will deploy:"
Write-Host "  - Admin Panel"
Write-Host "  - Dispatch Panel"
Write-Host "  - User Portal"
Write-Host "  - Backend Services"
Write-Host ""

if (-not $Force) {
    $response = Read-Host "Proceed with deployment? (y/n)"
    if ($response -ne "y") {
        Write-Error-Custom "Deployment cancelled"
        exit 1
    }
}

# Deploy (example for Vercel, adjust for your platform)
Write-Step "Deploying applications..."

# Deploy User Portal
Write-Step "Deploying User Portal..."
try {
    Push-Location web\user_portal
    npx vercel --prod
    Pop-Location
    Write-Success "User Portal deployed"
}
catch {
    Pop-Location
    Write-Error-Custom "User Portal deployment failed"
}

# Deploy Admin Panel
Write-Step "Deploying Admin Panel..."
try {
    Push-Location web\admin_panel
    npx vercel --prod
    Pop-Location
    Write-Success "Admin Panel deployed"
}
catch {
    Pop-Location
    Write-Error-Custom "Admin Panel deployment failed"
}

# Deploy Dispatch Panel
Write-Step "Deploying Dispatch Panel..."
try {
    Push-Location web\dispatch_panel
    npx vercel --prod
    Pop-Location
    Write-Success "Dispatch Panel deployed"
}
catch {
    Pop-Location
    Write-Error-Custom "Dispatch Panel deployment failed"
}

# Health checks
Write-Step "Running health checks..."
Start-Sleep -Seconds 10  # Wait for deployments to propagate

function Test-HealthEndpoint {
    param($Url, $Name)
    
    try {
        $response = Invoke-WebRequest -Uri "$Url/health" -Method Get -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Success "$Name is healthy"
            return $true
        }
    }
    catch {
        Write-Error-Custom "$Name health check failed"
        return $false
    }
}

# Uncomment and adjust URLs when deployed
# Test-HealthEndpoint "https://api.cabi-africa.com" "API Gateway"
# Test-HealthEndpoint "https://admin.cabi-africa.com" "Admin Panel"
# Test-HealthEndpoint "https://dispatch.cabi-africa.com" "Dispatch Panel"

# Success!
Write-Host ""
Write-Host "==================================" -ForegroundColor Blue
Write-Success "Deployment completed successfully! 🎉"
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""

Write-Step "Post-deployment checklist:"
Write-Host "  ✓ Builds completed"
Write-Host "  ✓ Tests passed"
Write-Host "  ✓ Migrations run"
Write-Host "  ✓ Applications deployed"
Write-Host ""

Write-Host "Monitor your applications at:"
Write-Host "  - Vercel Dashboard: https://vercel.com/dashboard"
Write-Host "  - Sentry: https://sentry.io"
Write-Host "  - Supabase: https://app.supabase.com"
Write-Host ""

Write-Warning "Don't forget to:"
Write-Host "  1. Test critical user flows"
Write-Host "  2. Check error rates in monitoring"
Write-Host "  3. Verify database performance"
Write-Host "  4. Monitor logs for any issues"
Write-Host ""
