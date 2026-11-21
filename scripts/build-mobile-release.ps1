# ==============================================================================
# CABI AFRICA - MOBILE PRODUCTION RELEASE BUILDER (POWERSHELL)
# ==============================================================================
param(
    [switch]$BuildAppBundle = $false,
    [switch]$SkipPassenger = $false,
    [switch]$SkipDriver = $false
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$DistDir = Join-Path $RootDir "dist\mobile"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   CABI AFRICA - MOBILE RELEASE BUILD PIPELINE (PROD)       " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
}

$DartDefines = @(
    "--dart-define=IS_PRODUCTION=true"
)

# ------------------------------------------------------------------------------
# 1. BUILD CABI GO (PASSENGER APP)
# ------------------------------------------------------------------------------
if (-not $SkipPassenger) {
    Write-Host "`nBuilding Cabi Go (Passenger App) [Application ID: africa.cabi.passenger]..." -ForegroundColor Yellow
    $PassengerDir = Join-Path $RootDir "mobile\passenger_app"
    Push-Location $PassengerDir

    try {
        Write-Host "   Running flutter pub get..." -ForegroundColor Gray
        flutter pub get

        Write-Host "   Compiling Release APK..." -ForegroundColor Gray
        flutter build apk --release @DartDefines

        $PassengerApk = Join-Path $PassengerDir "build\app\outputs\flutter-apk\app-release.apk"
        if (Test-Path $PassengerApk) {
            $DestApk = Join-Path $DistDir "Cabi-Go-Production.apk"
            $DestOfficial = Join-Path $DistDir "Cabi-Go-Official.apk"
            $RootApk = Join-Path $RootDir "Cabi-Go-Official.apk"
            Copy-Item $PassengerApk -Destination $DestApk -Force
            Copy-Item $PassengerApk -Destination $DestOfficial -Force
            Copy-Item $PassengerApk -Destination $RootApk -Force
            Write-Host "   [SUCCESS] Passenger APK ready: $DestApk" -ForegroundColor Green
            Write-Host "   [SUCCESS] Passenger Official APK ready: $DestOfficial" -ForegroundColor Green
        }

        if ($BuildAppBundle) {
            Write-Host "   Compiling Release App Bundle (AAB)..." -ForegroundColor Gray
            flutter build appbundle --release @DartDefines
            $PassengerAab = Join-Path $PassengerDir "build\app\outputs\bundle\release\app-release.aab"
            if (Test-Path $PassengerAab) {
                $DestAab = Join-Path $DistDir "Cabi-Go-Production.aab"
                Copy-Item $PassengerAab -Destination $DestAab -Force
                Write-Host "   [SUCCESS] Passenger AAB ready: $DestAab" -ForegroundColor Green
            }
        }
    } finally {
        Pop-Location
    }
}

# ------------------------------------------------------------------------------
# 2. BUILD CABI DRIVE (DRIVER APP)
# ------------------------------------------------------------------------------
if (-not $SkipDriver) {
    Write-Host "`nBuilding Cabi Drive (Driver App) [Application ID: africa.cabi.driver]..." -ForegroundColor Yellow
    $DriverDir = Join-Path $RootDir "mobile\driver_app"
    Push-Location $DriverDir

    try {
        Write-Host "   Running flutter pub get..." -ForegroundColor Gray
        flutter pub get

        Write-Host "   Compiling Release APK..." -ForegroundColor Gray
        flutter build apk --release @DartDefines

        $DriverApk = Join-Path $DriverDir "build\app\outputs\flutter-apk\app-release.apk"
        if (Test-Path $DriverApk) {
            $DestApk = Join-Path $DistDir "Cabi-Drive-Production.apk"
            $DestOfficial = Join-Path $DistDir "Cabi-Drive-Official.apk"
            $RootApk = Join-Path $RootDir "Cabi-Drive-Official.apk"
            Copy-Item $DriverApk -Destination $DestApk -Force
            Copy-Item $DriverApk -Destination $DestOfficial -Force
            Copy-Item $DriverApk -Destination $RootApk -Force
            Write-Host "   [SUCCESS] Driver APK ready: $DestApk" -ForegroundColor Green
            Write-Host "   [SUCCESS] Driver Official APK ready: $DestOfficial" -ForegroundColor Green
        }

        if ($BuildAppBundle) {
            Write-Host "   Compiling Release App Bundle (AAB)..." -ForegroundColor Gray
            flutter build appbundle --release @DartDefines
            $DriverAab = Join-Path $DriverDir "build\app\outputs\bundle\release\app-release.aab"
            if (Test-Path $DriverAab) {
                $DestAab = Join-Path $DistDir "Cabi-Drive-Production.aab"
                Copy-Item $DriverAab -Destination $DestAab -Force
                Write-Host "   [SUCCESS] Driver AAB ready: $DestAab" -ForegroundColor Green
            }
        }
    } finally {
        Pop-Location
    }
}

Write-Host "`nProduction Release Build Finished!" -ForegroundColor Cyan
Write-Host "Artifacts written to: $DistDir" -ForegroundColor Cyan
