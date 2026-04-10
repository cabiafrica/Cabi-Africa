Set-Location "d:\IBN\PROJECTS\Cabi Africa\web\admin_panel"
npx tsc --noEmit 2>&1 | Out-File -FilePath "d:\IBN\PROJECTS\Cabi Africa\ts_errors.log" -Encoding utf8
