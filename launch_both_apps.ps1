# PowerShell script to robustly launch both Driver and Passenger apps
# Usage: .\launch_both_apps.ps1

Write-Host "=== Cabi Africa - Dual App Launcher (Robust) ===" -ForegroundColor Cyan
Write-Host ""

# Environment Setup
$env:ANDROID_AVD_HOME = "D:\IBN\MAD\avd"
$emulatorPath = "D:\IBN\MAD\android\Sdk\emulator\emulator.exe"
$adbPath = "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe"
$projectRoot = "d:\IBN\PROJECTS\Cabi Africa"

# Configuration
# CHANGED: Using Medium_Phone for Driver App instead of Pixel_6
$driverAvd = "Medium_Phone"
$passengerAvd = "Passenger_Lite"

# Helper function to get AVD name with retry
function Get-AvdName {
    param ($deviceId)
    $maxRetries = 5
    $retryCount = 0
    $name = ""

    while ([string]::IsNullOrWhiteSpace($name) -and $retryCount -lt $maxRetries) {
        try {
            $result = & $adbPath -s $deviceId shell getprop ro.boot.qemu.avd_name 2>$null
            if ($result) {
                $name = $result.Trim()
            }
        }
        catch {
            Write-Host "." -NoNewline
        }
        
        if ([string]::IsNullOrWhiteSpace($name)) {
            Start-Sleep -Milliseconds 500
            $retryCount++
        }
    }
    return $name
}

# Helper to wait for full boot
function Wait-ForDeviceBoot {
    param ($deviceId, $avdName)
    Write-Host "Waiting for $avdName ($deviceId) to fully boot..." -NoNewline
    
    $timeoutSeconds = 180
    $startTime = Get-Date

    while ($true) {
        $bootCompleted = & $adbPath -s $deviceId shell getprop sys.boot_completed 2>$null
        
        if ($bootCompleted -and $bootCompleted.Trim() -eq "1") {
            Write-Host " Ready!" -ForegroundColor Green
            return $true
        }

        if ((Get-Date) -gt $startTime.AddSeconds($timeoutSeconds)) {
            Write-Host " Timeout waiting for boot." -ForegroundColor Red
            return $false
        }
        
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

# Reset ADB to ensure clean state
Write-Host "Resetting ADB server..." -ForegroundColor Yellow
& $adbPath kill-server
& $adbPath start-server | Out-Null

function Identify-Emulators {
    $devices = & $adbPath devices | Select-String "emulator-"
    $driverId = $null
    $passengerId = $null
    
    foreach ($dev in $devices) {
        if ($dev -match "(emulator-\d+)\s+device") {
            $id = $matches[1]
            $avd = Get-AvdName -deviceId $id
            
            if ($avd -eq $driverAvd) { $driverId = $id }
            if ($avd -eq $passengerAvd) { $passengerId = $id }
        }
    }
    return @{ Driver = $driverId; Passenger = $passengerId }
}

$currentEmulators = Identify-Emulators
$driverId = $currentEmulators.Driver
$passengerId = $currentEmulators.Passenger

# Launch Driver AVD if not running
if (-not $driverId) {
    Write-Host "Launching $driverAvd (Driver App) with cold boot..." -ForegroundColor Yellow
    Start-Process $emulatorPath -ArgumentList "-avd $driverAvd", "-no-snapshot-load"
    
    Write-Host "Waiting for $driverAvd to appear in ADB..." -NoNewline
    $loops = 0
    while (-not $driverId -and $loops -lt 45) {
        Start-Sleep -Seconds 2
        $currentEmulators = Identify-Emulators
        $driverId = $currentEmulators.Driver
        if ($driverId) { break }
        Write-Host "." -NoNewline
        $loops++
    }
    Write-Host ""
}

# Launch Passenger AVD if not running
if (-not $passengerId) {
    Write-Host "Launching $passengerAvd (Passenger App)..." -ForegroundColor Yellow
    Start-Process $emulatorPath -ArgumentList "-avd $passengerAvd"
    
    Write-Host "Waiting for $passengerAvd to appear in ADB..." -NoNewline
    $loops = 0
    while (-not $passengerId -and $loops -lt 45) {
        Start-Sleep -Seconds 2
        $currentEmulators = Identify-Emulators
        $passengerId = $currentEmulators.Passenger
        if ($passengerId) { break }
        Write-Host "." -NoNewline
        $loops++
    }
    Write-Host ""
}

# Verify both are running
$currentEmulators = Identify-Emulators
$driverId = $currentEmulators.Driver
$passengerId = $currentEmulators.Passenger

if (-not $driverId) {
    Write-Host "Error: $driverAvd failed to start or connect to ADB." -ForegroundColor Red
}
if (-not $passengerId) {
    Write-Host "Error: $passengerAvd failed to start or connect to ADB." -ForegroundColor Red
}

if ($driverId) { Wait-ForDeviceBoot -deviceId $driverId -avdName $driverAvd }
if ($passengerId) { Wait-ForDeviceBoot -deviceId $passengerId -avdName $passengerAvd }

Write-Host ""
if ($driverId -and $passengerId) {
    Write-Host "All emulators ready!" -ForegroundColor Green
    Write-Host "  Driver App    -> $driverAvd ($driverId)" -ForegroundColor Green
    Write-Host "  Passenger App -> $passengerAvd ($passengerId)" -ForegroundColor Magenta
}
else {
    Write-Host "Warning: Not all emulators are ready." -ForegroundColor Yellow
}
Write-Host ""

# Launch Apps
if ($driverId) {
    Write-Host "Starting Driver App on $driverId..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\mobile\driver_app'; Write-Host 'Driver App ($driverAvd)' -ForegroundColor Green; flutter run -d $driverId"
}

if ($passengerId) {
    Write-Host "Starting Passenger App on $passengerId..." -ForegroundColor Magenta
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\mobile\passenger_app'; Write-Host 'Passenger App ($passengerAvd)' -ForegroundColor Magenta; flutter run -d $passengerId"
}

Write-Host "Launch sequence initiated!" -ForegroundColor Cyan
