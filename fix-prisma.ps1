# Fix Prisma Generate Script
# Run this as Administrator if you have permission issues

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Stopping all Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 2

$prismaPath = "D:\IBN\PROJECTS\Cabi Africa\node_modules\.prisma\client"

Write-Host "Removing Prisma client cache..." -ForegroundColor Yellow
if (Test-Path $prismaPath) {
    Remove-Item -Path $prismaPath -Recurse -Force
    Write-Host "Prisma client cache removed" -ForegroundColor Green
}

Start-Sleep -Seconds 1

Write-Host "Regenerating Prisma client..." -ForegroundColor Yellow
Set-Location "D:\IBN\PROJECTS\Cabi Africa\libs\backend\database"

# Use npx to run prisma generate
$env:NODE_OPTIONS = "--max-old-space-size=4096"
& npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma generated successfully!" -ForegroundColor Green
} else {
    Write-Host "Prisma generation failed. Error code: $LASTEXITCODE" -ForegroundColor Red
}

Read-Host "Press Enter to exit"
