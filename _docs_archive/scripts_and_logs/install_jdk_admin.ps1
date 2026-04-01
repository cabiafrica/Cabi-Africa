# JDK 17 Installation Script (Run as Administrator)
# This script will automatically install JDK 17 using Chocolatey

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  JDK 17 Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "3. Navigate to: cd `"d:\IBN\PROJECTS\Cabi Africa`"" -ForegroundColor Yellow
    Write-Host "4. Run: .\install_jdk_admin.ps1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green
Write-Host ""

# Check if Chocolatey is installed
try {
    $chocoVersion = choco --version
    Write-Host "✅ Chocolatey $chocoVersion detected" -ForegroundColor Green
}
catch {
    Write-Host "❌ Chocolatey not found!" -ForegroundColor Red
    Write-Host "Please install Chocolatey first from: https://chocolatey.org/install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Installing JDK 17 (Eclipse Temurin)..." -ForegroundColor Cyan
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

# Install JDK 17
choco install temurin17 -y

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ JDK 17 Installed Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Close ALL PowerShell windows" -ForegroundColor Yellow
    Write-Host "2. Open a NEW PowerShell window (normal, not admin)" -ForegroundColor Yellow
    Write-Host "3. Run: java -version" -ForegroundColor Yellow
    Write-Host "4. Restart Android Studio" -ForegroundColor Yellow
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    Write-Host "Please try manual installation using INSTALL_JDK.md" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
