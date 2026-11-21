param(
    [switch]$RunPassenger = $false,
    [switch]$RunDriver = $false,
    [switch]$BuildPassenger = $false,
    [switch]$BuildDriver = $false
)

$ErrorActionPreference = "Continue"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   CABI AFRICA - USB LIVE PHONE TESTING SETUP               " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Locate ADB and Flutter
$adbPath = (Get-Command adb -ErrorAction SilentlyContinue).Source
if (-not $adbPath) {
    $candidates = @(
        $(if ($env:ANDROID_HOME) { Join-Path $env:ANDROID_HOME "platform-tools\adb.exe" }),
        $(if ($env:ANDROID_SDK_ROOT) { Join-Path $env:ANDROID_SDK_ROOT "platform-tools\adb.exe" }),
        (Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe")
    )
    foreach ($cand in $candidates) {
        if ($cand -and (Test-Path $cand)) {
            $adbPath = $cand
            break
        }
    }
    if ($adbPath) {
        Write-Host "[INFO] Found ADB at: $adbPath" -ForegroundColor Gray
    } else {
        Write-Host "[ERROR] adb command not found in PATH or Android SDK." -ForegroundColor Red
        Write-Host "Please ensure Android SDK platform-tools is installed and on PATH." -ForegroundColor Yellow
        exit 1
    }
}

if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
    if (Test-Path "D:\IBN\MAD\flutter\bin\flutter.bat") {
        $env:PATH = "D:\IBN\MAD\flutter\bin;$env:PATH"
        Write-Host "[INFO] Added Flutter to PATH from D:\IBN\MAD\flutter\bin" -ForegroundColor Gray
    }
}

# 2. Check Connected Devices
Write-Host ""
Write-Host "[1/3] Checking connected Android devices..." -ForegroundColor Yellow
$devices = & $adbPath devices | Select-String -Pattern "device$"

if (-not $devices -or $devices.Count -eq 0) {
    Write-Host "[WARNING] No authorized Android device detected via USB!" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. USB cable is firmly connected." -ForegroundColor White
    Write-Host "  2. Developer Options -> USB Debugging is turned ON." -ForegroundColor White
    Write-Host "  3. Unlock your phone and accept 'Allow USB debugging' prompt." -ForegroundColor White
    Write-Host ""
    Write-Host "Current ADB Device List:" -ForegroundColor Gray
    & $adbPath devices
    exit 1
}

Write-Host "  [OK] Connected device(s) found:" -ForegroundColor Green
foreach ($d in $devices) {
    $devLine = $d.Line
    Write-Host "     - $devLine" -ForegroundColor Green
}

# 3. Setup ADB Reverse Port Forwarding
Write-Host ""
Write-Host "[2/3] Forwarding microservice ports over USB (Phone -> PC)..." -ForegroundColor Yellow

$portList = @(
    3333,
    3334,
    3335,
    3336,
    3337,
    3338,
    3003,
    3010,
    3000
)

foreach ($p in $portList) {
    & $adbPath reverse "tcp:$p" "tcp:$p"
    Write-Host "  [OK] Forwarded port $p" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[3/3] Reverse port tunnels established successfully!" -ForegroundColor Green
Write-Host "Network calls to 127.0.0.1 on phone will route directly to your PC." -ForegroundColor Cyan

# 4. Optional Actions
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

if ($RunPassenger) {
    Write-Host "`nLaunching Cabi Go (Passenger App)..." -ForegroundColor Cyan
    Set-Location (Join-Path $RootDir "mobile\passenger_app")
    flutter run --dart-define=API_HOST=127.0.0.1 --dart-define=IS_PRODUCTION=false
}
elseif ($RunDriver) {
    Write-Host "`nLaunching Cabi Drive (Driver App)..." -ForegroundColor Cyan
    Set-Location (Join-Path $RootDir "mobile\driver_app")
    flutter run --dart-define=API_HOST=127.0.0.1 --dart-define=IS_PRODUCTION=false
}
elseif ($BuildPassenger) {
    Write-Host "`nCompiling local USB-ready APK for Cabi Go..." -ForegroundColor Cyan
    Set-Location (Join-Path $RootDir "mobile\passenger_app")
    flutter build apk --debug --dart-define=API_HOST=127.0.0.1 --dart-define=IS_PRODUCTION=false
    $apkPath = Join-Path $RootDir "mobile\passenger_app\build\app\outputs\flutter-apk\app-debug.apk"
    if (Test-Path $apkPath) {
        Write-Host "Installing to phone..." -ForegroundColor Yellow
        & $adbPath install -r $apkPath
        Write-Host "[OK] Cabi Go installed on phone!" -ForegroundColor Green
    }
}
elseif ($BuildDriver) {
    Write-Host "`nCompiling local USB-ready APK for Cabi Drive..." -ForegroundColor Cyan
    Set-Location (Join-Path $RootDir "mobile\driver_app")
    flutter build apk --debug --target-platform android-arm,android-arm64 --dart-define=API_HOST=127.0.0.1 --dart-define=IS_PRODUCTION=false
    $apkPath = Join-Path $RootDir "mobile\driver_app\build\app\outputs\flutter-apk\app-debug.apk"
    if (Test-Path $apkPath) {
        Write-Host "Installing to phone..." -ForegroundColor Yellow
        & $adbPath install -r $apkPath
        Write-Host "[OK] Cabi Drive installed on phone!" -ForegroundColor Green
    }
}
else {
    Write-Host ""
    Write-Host "Next Steps to start testing:" -ForegroundColor Yellow
    Write-Host "  A) Run live with hot reload and console logs:" -ForegroundColor White
    Write-Host "     cd mobile\passenger_app; flutter run --dart-define=API_HOST=127.0.0.1 --dart-define=IS_PRODUCTION=false" -ForegroundColor Gray
    Write-Host "     cd mobile\driver_app; flutter run --dart-define=API_HOST=127.0.0.1 --dart-define=IS_PRODUCTION=false" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  B) Or build and install local USB debug APKs:" -ForegroundColor White
    Write-Host "     .\scripts\start-usb-live-test.ps1 -BuildPassenger" -ForegroundColor Gray
    Write-Host "     .\scripts\start-usb-live-test.ps1 -BuildDriver" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  C) Start local backend microservices on PC:" -ForegroundColor White
    Write-Host "     npm run serve:backend" -ForegroundColor Gray
}
