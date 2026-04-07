#!/usr/bin/env pwsh
# verify_builds.ps1 — TypeScript compilation check for all backend services

$Root = $PSScriptRoot | Split-Path -Parent
Set-Location $Root

$services = @(
    @{name="auth-gateway";        tsconfig="auth-gateway/tsconfig.app.json"},
    @{name="dispatch-service";    tsconfig="backend/dispatch-service/tsconfig.app.json"},
    @{name="verification-service";tsconfig="backend/verification-service/tsconfig.app.json"},
    @{name="referral-service";    tsconfig="backend/referral-service/tsconfig.app.json"},
    @{name="driver-lead-service"; tsconfig="backend/driver-lead-service/tsconfig.app.json"},
    @{name="sacco-service";       tsconfig="backend/sacco-service/tsconfig.app.json"},
    @{name="user-service";        tsconfig="libs/backend/user-service/tsconfig.app.json"},
    @{name="admin-service";       tsconfig="libs/backend/admin-service/tsconfig.app.json"}
)

$results = @()
$hasFail = $false

foreach ($s in $services) {
    $tsPath = Join-Path $Root $s.tsconfig
    if (-not (Test-Path $tsPath)) {
        $results += [PSCustomObject]@{Service=$s.name; Status="SKIP (no tsconfig)"; Errors=""}
        continue
    }

    $output = & npx tsc --noEmit --project $tsPath 2>&1
    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        $status = "✅ PASS"
    } else {
        $status = "❌ FAIL"
        $hasFail = $true
    }

    $errorLines = ($output | Where-Object { $_ -match "error TS" }) -join "`n"
    $results += [PSCustomObject]@{Service=$s.name; Status=$status; Errors=$errorLines}
}

Write-Host ""
Write-Host "========== TypeScript Verification Results ==========" -ForegroundColor Cyan
$results | Format-Table -AutoSize

$logPath = Join-Path $Root "tsc_results.txt"
$results | ForEach-Object { "$($_.Status) - $($_.Service)`n$($_.Errors)" } | Out-File -FilePath $logPath -Encoding utf8
Write-Host "Full results saved to: $logPath" -ForegroundColor Gray

if ($hasFail) {
    Write-Host "FAILED — one or more services have TypeScript errors." -ForegroundColor Red
    exit 1
} else {
    Write-Host "ALL SERVICES PASS — ready for build." -ForegroundColor Green
    exit 0
}
