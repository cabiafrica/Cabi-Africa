#!/usr/bin/env pwsh
$Root = $PSScriptRoot | Split-Path -Parent
Set-Location $Root
Write-Host "Rebuilding user_portal..."
& npm run build --workspace=web/user_portal 2>&1 | Out-File "user_portal_build3.txt" -Encoding utf8
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ user_portal BUILD PASS"
} else {
    Write-Host "❌ user_portal BUILD FAIL"
}
