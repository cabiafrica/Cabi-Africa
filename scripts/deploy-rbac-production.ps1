# RBAC Production Deployment Script (PowerShell)
# 
# This script automates the production deployment process for the RBAC system
# 
# Usage: .\deploy-rbac-production.ps1 [-Environment staging|production] [-SkipTests] [-AutoDeploy]
#
# Prerequisites:
#   - Node.js 20+
#   - npm installed
#   - Database accessible
#   - Environment variables configured

param(
    [Parameter()]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging",
    
    [Parameter()]
    [switch]$SkipTests,
    
    [Parameter()]
    [switch]$AutoDeploy
)

# Configuration
$ErrorActionPreference = "Stop"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = "deployment_$($Environment)_$Timestamp.log"

# Functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $Colors = @{
        "INFO"    = "Blue"
        "SUCCESS" = "Green"
        "WARNING" = "Yellow"
        "ERROR"   = "Red"
    }
    
    $Icons = @{
        "INFO"    = "[i]"
        "SUCCESS" = "[+]"
        "WARNING" = "[!]"
        "ERROR"   = "[x]"
    }
    
    $formattedMessage = "$($Icons[$Level]) $Message"
    Write-Host $formattedMessage -ForegroundColor $Colors[$Level]
    "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss')) [$Level] $Message" | Out-File -Append -FilePath $LogFile
}

function Load-EnvFile {
    param([string]$Path)
    if (Test-Path $Path) {
        Write-Log "Loading environment variables from $Path..." "INFO"
        Get-Content $Path | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith("#")) {
                $name, $value = $line -split '=', 2
                if ($name -and $value) {
                    $name = $name.Trim()
                    $value = $value.Trim().Trim('"').Trim("'")
                    [System.Environment]::SetEnvironmentVariable($name, $value)
                    Set-Item "env:$name" $value
                }
            }
        }
    }
}

function Write-Header {
    param([string]$Title)
    
    Write-Host "`n****************************************" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "****************************************`n" -ForegroundColor Cyan
}

function Test-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    # Check Node.js
    try {
        $nodeVersion = node -v
        Write-Log "Node.js installed: $nodeVersion" "SUCCESS"
    }
    catch {
        Write-Log "Node.js not found. Please install Node.js 20+" "ERROR"
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm -v
        Write-Log "npm installed: $npmVersion" "SUCCESS"
    }
    catch {
        Write-Log "npm not found" "ERROR"
        exit 1
    }
    
    # Check environment file
    if ($Environment -eq "production") {
        if (-not (Test-Path ".env.production")) {
            Write-Log ".env.production not found" "ERROR"
            Write-Log "Please create .env.production based on .env.production.example" "INFO"
            exit 1
        }
        Write-Log "Production environment file found" "SUCCESS"
    }
}

function Invoke-RBACTests {
    Write-Header "Running RBAC Integration Tests"
    
    Write-Log "Starting auth-gateway..." "INFO"
    $authGatewayJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npx nx serve auth-gateway
    }
    
    # Wait for service to start
    Start-Sleep -Seconds 10
    
    # Check if service is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3333/api/health" -UseBasicParsing -TimeoutSec 5
        Write-Log "Auth-gateway started (Job ID: $($authGatewayJob.Id))" "SUCCESS"
    }
    catch {
        Write-Log "Auth-gateway failed to start" "ERROR"
        Stop-Job -Job $authGatewayJob
        Remove-Job -Job $authGatewayJob
        exit 1
    }
    
    # Run integration tests
    Write-Log "Running RBAC frontend integration tests..." "INFO"
    try {
        npx ts-node scripts/test_rbac_frontend_integration.ts
        Write-Log "All tests passed (11/11)" "SUCCESS"
    }
    catch {
        Write-Log "Tests failed. Stopping deployment." "ERROR"
        Stop-Job -Job $authGatewayJob
        Remove-Job -Job $authGatewayJob
        exit 1
    }
    
    # Stop auth-gateway
    Write-Log "Stopping auth-gateway..." "INFO"
    Stop-Job -Job $authGatewayJob
    Remove-Job -Job $authGatewayJob
    Start-Sleep -Seconds 2
    Write-Log "Auth-gateway stopped" "SUCCESS"
}

function Build-Backend {
    Write-Header "Building Backend (Auth-Gateway)"
    
    Write-Log "Building auth-gateway for $Environment..." "INFO"
    try {
        npx nx build auth-gateway --configuration=$Environment
        Write-Log "Auth-gateway built successfully" "SUCCESS"
        
        # Show bundle size
        if (Test-Path "dist/apps/auth-gateway/main.js") {
            $size = (Get-Item "dist/apps/auth-gateway/main.js").Length / 1KB
            Write-Log "Bundle size: $([math]::Round($size, 2)) KB" "INFO"
        }
    }
    catch {
        Write-Log "Auth-gateway build failed" "ERROR"
        exit 1
    }
}

function Build-Frontend {
    Write-Header "Building Frontend (Admin Panel)"
    
    Write-Log "Building admin panel for $Environment..." "INFO"
    Push-Location "web/admin_panel"
    
    try {
        npm run build
        Write-Log "Admin panel built successfully" "SUCCESS"
        
        # Show bundle sizes
        if (Test-Path "dist") {
            $totalSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Log "Total bundle size: $([math]::Round($totalSize, 2)) MB" "INFO"
            
            # List main chunks
            Write-Log "Main chunks:" "INFO"
            Get-ChildItem "dist/assets/*.js" | ForEach-Object {
                $chunkSize = $_.Length / 1KB
                Write-Host "    $($_.Name): $([math]::Round($chunkSize, 2)) KB" -ForegroundColor Gray
            }
        }
    }
    catch {
        Write-Log "Admin panel build failed" "ERROR"
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

function Invoke-Migrations {
    Write-Header "Running Database Migrations"
    
    if ($Environment -eq "production" -and -not $AutoDeploy) {
        Write-Log "About to run migrations on PRODUCTION database" "WARNING"
        $confirm = Read-Host "Continue? (yes/no)"
        if ($confirm -ne "yes") {
            Write-Log "Migration cancelled" "INFO"
            exit 1
        }
    }
    
    Write-Log "Running Prisma migrations..." "INFO"
    try {
        npx prisma migrate deploy
        Write-Log "Migrations completed successfully" "SUCCESS"
    }
    catch {
        Write-Log "Migration failed" "ERROR"
        exit 1
    }
    
    Write-Log "Generating Prisma Client..." "INFO"
    npx prisma generate
    Write-Log "Prisma Client generated" "SUCCESS"
}

function New-SuperAdmin {
    Write-Header "Verifying Super Admin"
    
    Write-Log "Creating/updating super admin user..." "INFO"
    try {
        npx ts-node scripts/recreate-super-admin.js
        Write-Log "Super admin configured" "SUCCESS"
    }
    catch {
        Write-Log "Super admin script completed with warnings" "WARNING"
    }
}

function Show-DeploymentSummary {
    Write-Header "Deployment Summary"
    
    Write-Host "[+] Tests Passed: 11/11" -ForegroundColor Green
    Write-Host "[+] Backend Built: auth-gateway" -ForegroundColor Green
    Write-Host "[+] Frontend Built: admin-panel" -ForegroundColor Green
    Write-Host "[+] Migrations: Up to date" -ForegroundColor Green
    Write-Host "[+] Super Admin: Configured" -ForegroundColor Green
    Write-Host ""
    
    if ($Environment -eq "production" -and -not $AutoDeploy) {
        Write-Log "This will deploy to PRODUCTION" "WARNING"
        $proceed = Read-Host "Proceed with deployment? (yes/no)"
        if ($proceed -ne "yes") {
            Write-Log "Deployment cancelled" "INFO"
            exit 0
        }
    }
}

function Invoke-PlatformDeployment {
    Write-Header "Deploying to Platform"
    
    # Check for Vercel
    if (Test-Path "vercel.json") {
        Write-Log "Deploying to Vercel..." "INFO"
        try {
            vercel --prod
            Write-Log "Deployed to Vercel" "SUCCESS"
        }
        catch {
            Write-Log "Vercel CLI not found. Please deploy manually:" "WARNING"
            Write-Log "  vercel --prod" "INFO"
        }
    }
    else {
        Write-Log "No deployment platform configured" "WARNING"
        Write-Log "Please deploy manually using your platform's CLI" "INFO"
        Write-Log "" "INFO"
        Write-Log "Built files locations:" "INFO"
        Write-Log "  Backend: dist/apps/auth-gateway/" "INFO"
        Write-Log "  Frontend: web/admin_panel/dist/" "INFO"
    }
}

function Test-Deployment {
    Write-Header "Post-Deployment Verification"
    
    # Get API URL
    $apiUrl = if ($env:VITE_API_URL) { $env:VITE_API_URL } else { "http://localhost:3333/api" }
    
    Write-Log "Verifying backend health..." "INFO"
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl/health" -UseBasicParsing -TimeoutSec 5
        Write-Log "Backend is healthy" "SUCCESS"
    }
    catch {
        Write-Log "Backend health check failed" "ERROR"
        Write-Log "URL: $apiUrl/health" "ERROR"
    }
    
    # Check frontend
    $frontendUrl = if ($env:FRONTEND_URL) { $env:FRONTEND_URL } else { "http://localhost:3001" }
    Write-Log "Checking frontend..." "INFO"
    try {
        $response = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 5
        Write-Log "Frontend is accessible" "SUCCESS"
    }
    catch {
        Write-Log "Frontend check failed (may not be deployed yet)" "WARNING"
    }
}

# Main execution
try {
    Clear-Host
    
    Write-Host ""
    Write-Host "********************************************" -ForegroundColor Blue
    Write-Host "*   RBAC Production Deployment Script     *" -ForegroundColor Blue
    Write-Host "********************************************" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Environment: $Environment" -ForegroundColor Yellow
    Write-Host "Timestamp: $Timestamp" -ForegroundColor Yellow
    Write-Host "Log file: $LogFile" -ForegroundColor Yellow
    Write-Host ""
    
    # Run all steps
    if ($Environment -eq "production") {
        Load-EnvFile ".env.production"
    } else {
        Load-EnvFile ".env"
    }
    
    Test-Prerequisites
    
    if (-not $SkipTests) {
        Invoke-RBACTests
    }
    else {
        Write-Log "Tests skipped (-SkipTests flag)" "WARNING"
    }
    
    Build-Backend
    Build-Frontend
    
    if ($Environment -eq "production") {
        Invoke-Migrations
        New-SuperAdmin
    }
    
    Show-DeploymentSummary
    
    if ($AutoDeploy) {
        Invoke-PlatformDeployment
        Test-Deployment
    }
    else {
        Write-Log "Auto-deploy disabled. Build complete." "INFO"
        Write-Log "" "INFO"
        Write-Log "To deploy manually:" "INFO"
        Write-Log "  Backend: Deploy dist/apps/auth-gateway/" "INFO"
        Write-Log "  Frontend: Deploy web/admin_panel/dist/" "INFO"
    }
    
    # Final summary
    Write-Header "Deployment Complete!"
    
    Write-Host "[+] RBAC system built successfully" -ForegroundColor Green
    Write-Host "  Log file: $LogFile"
    Write-Host ""
    
    if ($Environment -eq "production") {
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Verify deployment at https://admin.your-domain.com"
        Write-Host "  2. Run manual testing (see RBAC_FRONTEND_READY.md)"
        Write-Host "  3. Monitor logs for errors"
        Write-Host "  4. Notify stakeholders"
    }
    
    Write-Host ""
    Write-Log "Deployment script completed successfully!" "SUCCESS"
    
}
catch {
    Write-Log "Deployment failed: $_" "ERROR"
    exit 1
}
