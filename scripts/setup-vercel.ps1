# setup-vercel.ps1
# Automates the creation of Vercel projects, domains, and environment variables.
# Usage:
# 1. Open PowerShell
# 2. Login to Vercel first: npx vercel login
# 3. Run: .\scripts\setup-vercel.ps1

Write-Host "🚀 Starting Cabi Africa Vercel Configuration..." -ForegroundColor Cyan

# Define Project Names
$userPortalProp = "user_portal"
$adminPanelProp = "admin_panel"
$dispatchPanelProp = "dispatch_panel"

# 1. Create Projects
Write-Host "Projects already exist in Vercel..." -ForegroundColor Yellow
# npx vercel project add $userPortalProp
# npx vercel project add $adminPanelProp
# npx vercel project add $dispatchPanelProp

# 2. Helper function to add Environment variables
function Add-VercelEnv {
    param (
        [string]$ProjectName,
        [string]$Key,
        [string]$Value
    )
    Write-Host "   -> Adding $Key to $ProjectName" -ForegroundColor DarkGray
    # Pipe the value directly into the Vercel CLI to bypass interactive prompt for the value
    $Value | npx vercel env add $Key production $ProjectName
}

# 3. Add Environment Variables

Write-Host "Setting up User Portal Environment Variables..." -ForegroundColor Yellow
Add-VercelEnv $userPortalProp "NEXT_PUBLIC_API_URL" "https://auth-gateway-746659778850.us-central1.run.app/api"
Add-VercelEnv $userPortalProp "NEXT_PUBLIC_SOCKET_URL" "https://auth-gateway-746659778850.us-central1.run.app"
Add-VercelEnv $userPortalProp "NEXT_PUBLIC_DRIVER_LEAD_SERVICE_URL" "https://driver-lead-service-746659778850.us-central1.run.app"
Add-VercelEnv $userPortalProp "NEXT_PUBLIC_DISPATCH_SERVICE_URL" "https://dispatch-service-746659778850.us-central1.run.app"
Add-VercelEnv $userPortalProp "NEXT_PUBLIC_SACCO_SERVICE_URL" "https://sacco-service-746659778850.us-central1.run.app"
Add-VercelEnv $userPortalProp "NEXT_PUBLIC_REFERRAL_SERVICE_URL" "https://referral-service-746659778850.us-central1.run.app"
# Mock placeholders for CMS variables because empty string stdin is sometimes rejected
Add-VercelEnv $userPortalProp "CMS_API_URL" "placeholder"
Add-VercelEnv $userPortalProp "CMS_API_TOKEN" "placeholder"


Write-Host "Setting up Admin Panel Environment Variables..." -ForegroundColor Yellow
Add-VercelEnv $adminPanelProp "VITE_API_URL" "https://auth-gateway-746659778850.us-central1.run.app/api"
Add-VercelEnv $adminPanelProp "VITE_SOCKET_URL" "https://auth-gateway-746659778850.us-central1.run.app"
Add-VercelEnv $adminPanelProp "VITE_DRIVER_LEAD_SERVICE_URL" "https://driver-lead-service-746659778850.us-central1.run.app"
Add-VercelEnv $adminPanelProp "VITE_DISPATCH_SERVICE_URL" "https://dispatch-service-746659778850.us-central1.run.app"


Write-Host "Setting up Dispatch Panel Environment Variables..." -ForegroundColor Yellow
Add-VercelEnv $dispatchPanelProp "VITE_API_URL" "https://auth-gateway-746659778850.us-central1.run.app/api"
Add-VercelEnv $dispatchPanelProp "VITE_DISPATCH_API_URL" "https://auth-gateway-746659778850.us-central1.run.app/api/dispatch"
Add-VercelEnv $dispatchPanelProp "VITE_SOCKET_URL" "https://auth-gateway-746659778850.us-central1.run.app"
Add-VercelEnv $dispatchPanelProp "VITE_TRIP_TRACKING_NAMESPACE" "/trip-tracking"


# 4. Configure Domains
Write-Host "Configuring Custom Domains..." -ForegroundColor Yellow
npx vercel domains add app.cabi-africa.com --project $userPortalProp
npx vercel domains add admin.cabi-africa.com --project $adminPanelProp
npx vercel domains add dispatch.cabi-africa.com --project $dispatchPanelProp

Write-Host "✅ Vercel Project Setup Script Completed successfully!" -ForegroundColor Green
Write-Host "--------------------------------------------------------"
Write-Host "⚠️ Manual Actions Still Required for GitHub secrets:" -ForegroundColor Red
Write-Host "1. Create a VERCEL_TOKEN in your global Vercel account settings"
Write-Host "2. Retrieve your VERCEL_ORG_ID"
Write-Host "3. Link the repositories manually or grab the individual Project IDs:"
Write-Host "   - VERCEL_USER_PORTAL_PROJECT_ID"
Write-Host "   - VERCEL_ADMIN_PANEL_PROJECT_ID"
Write-Host "   - VERCEL_DISPATCH_PANEL_PROJECT_ID"
Write-Host "4. Add all these to your GitHub Repository Secrets."
