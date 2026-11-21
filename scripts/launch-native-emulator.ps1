# Script to launch visible Android Emulator on Windows Desktop without GPU crashes
param (
    [string]$Avd = "cabi_driver_emulator",
    [string]$Gpu = "angle_indirect" # angle_indirect or swiftshader_indirect avoids Intel HD Graphics OpenGL crash
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  CABI AFRICA: LAUNCHING NATIVE DESKTOP ANDROID EMULATOR  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[*] AVD Name: $Avd" -ForegroundColor Green
Write-Host "[*] GPU Mode: $Gpu (Safe ANGLE Direct3D 11 Renderer)" -ForegroundColor Green

$emulatorExe = "D:\IBN\MAD\android\Sdk\emulator\emulator.exe"
$adbExe = "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe"

# Launch visible emulator
Start-Process $emulatorExe -ArgumentList "-avd", "$Avd", "-gpu", "$Gpu", "-no-boot-anim"

Write-Host "[*] Waiting for emulator to boot..." -ForegroundColor Cyan
& $adbExe wait-for-device

Write-Host "[*] Setting reverse port tunnels for local backend APIs..." -ForegroundColor Cyan
& $adbExe reverse tcp:3333 tcp:3333
& $adbExe reverse tcp:3334 tcp:3334
& $adbExe reverse tcp:3335 tcp:3335

Write-Host "[√] Native Android Emulator window is now visible on your desktop!" -ForegroundColor Green
Write-Host "[*] Launching Cabi Driver app..." -ForegroundColor Cyan
& $adbExe shell am start -n africa.cabi.driver/.MainActivity
