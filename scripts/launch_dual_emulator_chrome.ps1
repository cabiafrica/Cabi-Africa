# Script to launch Cabi Africa Dual Mobile Emulator Studio in Chrome
param (
    [int]$Port = 8080,
    [int]$Width = 1280,
    [int]$Height = 920
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  CABI AFRICA: DUAL MOBILE EMULATOR STUDIO IN CHROME   " -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Check if backend services are running (Auth Gateway: 3333, Dispatch: 3334)
$authRunning = (netstat -ano | findstr ":3333") -ne $null
if (-not $authRunning) {
    if (Test-Path "$PSScriptRoot\..\dist\auth-gateway\main.js") {
        Write-Host "[*] Starting Auth Gateway on port 3333..." -ForegroundColor Green
        Start-Process "node" -ArgumentList "dist/auth-gateway/main.js" -WorkingDirectory "$PSScriptRoot\.."
    }
} else {
    Write-Host "[√] Auth Gateway is active on port 3333" -ForegroundColor Green
}

$dispatchRunning = (netstat -ano | findstr ":3334") -ne $null
if (-not $dispatchRunning) {
    if (Test-Path "$PSScriptRoot\..\dist\backend\dispatch-service\main.js") {
        Write-Host "[*] Starting Dispatch Service on port 3334..." -ForegroundColor Green
        Start-Process "node" -ArgumentList "dist/backend/dispatch-service/main.js" -WorkingDirectory "$PSScriptRoot\.."
    }
} else {
    Write-Host "[√] Dispatch Service is active on port 3334" -ForegroundColor Green
}

# 2. Check if dual emulator server is running on port 8080
$serverRunning = (netstat -ano | findstr ":$Port") -ne $null
if (-not $serverRunning) {
    Write-Host "[*] Starting Dual Emulator Web Server on port $Port..." -ForegroundColor Green
    Start-Process "node" -ArgumentList "scripts/serve-dual-emulator.js" -WorkingDirectory "$PSScriptRoot\.."
    Start-Sleep -Seconds 2
} else {
    Write-Host "[√] Dual Emulator Web Server is active on port $Port" -ForegroundColor Green
}

# 3. Locate Chrome or default browser
$chromeExe = "chrome.exe"
if (-not (Get-Command chrome.exe -ErrorAction SilentlyContinue)) {
    $potentialPaths = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
    )
    foreach ($p in $potentialPaths) {
        if (Test-Path $p) { $chromeExe = $p; break }
    }
}

# 4. Launch Chrome Window
$url = "http://localhost:$Port/dual_emulator.html"
Write-Host "[*] Opening Dual Mobile Studio in Chrome ($Width x $Height)..." -ForegroundColor Cyan
try {
    Start-Process $chromeExe -ArgumentList "--new-window", "--app=$url", "--window-size=$Width,$Height"
} catch {
    Write-Host "[!] Chrome app mode failed, opening in default browser..." -ForegroundColor Yellow
    Start-Process $url
}

Write-Host "[√] Ready! Cabi Africa Dual Mobile Emulator Studio is live at $url" -ForegroundColor Green
