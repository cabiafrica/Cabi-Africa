# CABI Africa - Allow Inbound Firewall Ports for Local Mobile Testing
# Run this script in an elevated PowerShell prompt (Run as Administrator) if phone cannot reach PC.

Write-Host "Configuring Windows Defender Firewall for CABI Africa Mobile Dev..." -ForegroundColor Cyan

try {
    # Port 3333 (Auth Gateway)
    New-NetFirewallRule -DisplayName "CABI Africa - Auth Gateway (3333)" `
        -Direction Inbound -LocalPort 3333 -Protocol TCP -Action Allow `
        -Profile Private,Domain -ErrorAction SilentlyContinue | Out-Null

    # Port 3334 (Dispatch Service & Sockets)
    New-NetFirewallRule -DisplayName "CABI Africa - Dispatch Service (3334)" `
        -Direction Inbound -LocalPort 3334 -Protocol TCP -Action Allow `
        -Profile Private,Domain -ErrorAction SilentlyContinue | Out-Null

    # Port 8080 (Local APK Distribution Server)
    New-NetFirewallRule -DisplayName "CABI Africa - APK Portal (8080)" `
        -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow `
        -Profile Private,Domain -ErrorAction SilentlyContinue | Out-Null

    Write-Host "SUCCESS: Firewall rules created for ports 3333, 3334, and 8080." -ForegroundColor Green
} catch {
    Write-Host "WARNING: Failed to configure firewall. Please make sure you run PowerShell as Administrator." -ForegroundColor Yellow
}
