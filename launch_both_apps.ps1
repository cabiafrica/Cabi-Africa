# PowerShell script to launch both Driver and Passenger apps
# Usage: .\launch_both_apps.ps1

Write-Host "=== Cabi Africa - Dual App Launcher ===" -ForegroundColor Cyan
Write-Host ""

# Environment Setup
$env:ANDROID_AVD_HOME = "D:\IBN\MAD\avd"
$emulatorPath = "D:\IBN\MAD\android\Sdk\emulator\emulator.exe"
$projectRoot = "d:\IBN\PROJECTS\Cabi Africa"

# Check if emulators are running
Write-Host "Checking for running emulators..." -ForegroundColor Yellow
$runningDevices = flutter devices 2>&1

# Driver Emulator (Pixel_6)
if ($runningDevices -match "Pixel_6") {
    Write-Host "✓ Driver Emulator (Pixel_6) is already running." -ForegroundColor Green
}
else {
    Write-Host "Launching Driver Emulator (Pixel_6)..." -ForegroundColor Yellow
    Start-Process $emulatorPath -ArgumentList "-avd Pixel_6" -WindowStyle Minimized
}

# Passenger Emulator (Pixel_6_Passenger)
if ($runningDevices -match "Pixel_6_Passenger") {
    Write-Host "✓ Passenger Emulator (Pixel_6_Passenger) is already running." -ForegroundColor Green
}
else {
    Write-Host "Launching Passenger Emulator (Pixel_6_Passenger)..." -ForegroundColor Yellow
    Start-Process $emulatorPath -ArgumentList "-avd Pixel_6_Passenger" -WindowStyle Minimized
}

Write-Host "Waiting for emulators to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "=== Launching Apps ===" -ForegroundColor Cyan
Write-Host ""

# Launch Driver App
Write-Host "Starting Driver App..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\mobile\driver_app'; Write-Host 'Driver App Terminal' -ForegroundColor Green; flutter run -d Pixel_6"

# Launch Passenger App
Write-Host "Starting Passenger App..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\mobile\passenger_app'; Write-Host 'Passenger App Terminal' -ForegroundColor Magenta; flutter run -d Pixel_6_Passenger"

Write-Host ""
Write-Host "=== Launch sequence complete! ===" -ForegroundColor Cyan
Write-Host "Two terminals have been opened to manage the apps." -ForegroundColor White
Write-Host "Please wait for the emulators to finish booting and the apps to deploy." -ForegroundColor Yellow
Write-Host ""
Write-Host "Tips:" -ForegroundColor Cyan
Write-Host "  - Press 'r' in the app terminals for hot reload" -ForegroundColor Gray
Write-Host "  - Press 'R' for hot restart" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy testing!" -ForegroundColor Green
