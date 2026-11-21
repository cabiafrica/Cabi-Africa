# Script to launch Cabi Driver and Passenger apps side-by-side in Chrome mobile simulation
param (
    [int]$DriverPort = 8085,
    [int]$PassengerPort = 8086,
    [int]$Width = 430,
    [int]$Height = 932
)

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  CABI AFRICA: SIDE-BY-SIDE MOBILE SIMULATOR     " -ForegroundColor Yellow
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Check if Driver server is responding
$driverActive = (netstat -ano | findstr ":$DriverPort") -ne $null
if (-not $driverActive) {
    Write-Host "[*] Starting Driver App Web Server on port $DriverPort..." -ForegroundColor Green
    Start-Process "flutter" -ArgumentList "run -d web-server --web-port $DriverPort --web-hostname 127.0.0.1" -WorkingDirectory "$PSScriptRoot\..\mobile\driver_app"
} else {
    Write-Host "[√] Driver App Web Server is active on port $DriverPort" -ForegroundColor Green
}

# 2. Check if Passenger server is responding
$passengerActive = (netstat -ano | findstr ":$PassengerPort") -ne $null
if (-not $passengerActive) {
    Write-Host "[*] Starting Passenger App Web Server on port $PassengerPort..." -ForegroundColor Green
    Start-Process "flutter" -ArgumentList "run -d web-server --web-port $PassengerPort --web-hostname 127.0.0.1" -WorkingDirectory "$PSScriptRoot\..\mobile\passenger_app"
} else {
    Write-Host "[√] Passenger App Web Server is active on port $PassengerPort" -ForegroundColor Green
}

# 3. Launch Chrome windows side-by-side with smartphone aspect ratio
Write-Host "[*] Launching Chrome side-by-side emulator windows..." -ForegroundColor Cyan

# Left: Driver App (X=80, Y=60)
Start-Process "chrome.exe" -ArgumentList "--new-window", "--app=http://127.0.0.1:$DriverPort/#/home", "--window-size=$Width,$Height", "--window-position=80,60"

# Right: Passenger App (X=540, Y=60)
Start-Process "chrome.exe" -ArgumentList "--new-window", "--app=http://127.0.0.1:$PassengerPort/#/home", "--window-size=$Width,$Height", "--window-position=540,60"

Write-Host "[√] Done! Driver and Passenger apps are running side by side." -ForegroundColor Green
