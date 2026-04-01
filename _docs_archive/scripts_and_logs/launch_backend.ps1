# Simple Launch Backend Script
Write-Host "Starting Postgres..."
docker-compose up -d postgres
Start-Sleep -Seconds 5

$root = "d:\IBN\PROJECTS\Cabi Africa"

Write-Host "Launching Auth Gateway..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npx nx serve auth-gateway"

Write-Host "Launching Dispatch Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npx nx serve dispatch-service"

Write-Host "Launching Driver Lead Service..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; npx nx serve driver-lead-service"

Write-Host "All services launched."
