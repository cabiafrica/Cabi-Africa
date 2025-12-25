# Powershell script to finalize directory cleanup and fixing paths

# 1. Attempt using robust move (try-catch style via error action)
Write-Host "Moving mobile directory..."
Move-Item -Path "Cabi Alpha\mobile" -Destination . -ErrorAction SilentlyContinue

Write-Host "Moving _archive directory..."
Move-Item -Path "Cabi Alpha\_archive" -Destination . -ErrorAction SilentlyContinue

# 2. Fix pubspec.yaml paths (Change ../../../libs to ../../libs)
Write-Host "Fixing pubspec.yaml paths in mobile apps..."
$pubspecs = Get-ChildItem -Path "mobile" -Recurse -Filter "pubspec.yaml" -ErrorAction SilentlyContinue
if ($pubspecs) {
    foreach ($file in $pubspecs) {
        Write-Host "Updating $($file.FullName)"
        $content = Get-Content $file.FullName
        $newContent = $content -replace '\.\./\.\./\.\./libs', '../../libs'
        Set-Content -Path $file.FullName -Value $newContent
    }
} else {
    Write-Host "No pubspec.yaml files found. Did 'mobile' folder move successfully?"
}

# 3. Clean up the empty nested folder
if (Test-Path "Cabi Alpha\Cabi Alpha") {
    Write-Host "Removing nested Cabi Alpha folder..."
    Remove-Item -Path "Cabi Alpha" -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Git Instructions
Write-Host "`n---------------------------------------------------"
Write-Host "PRE-UPLOAD CHECKLIST:"
Write-Host "1. Ensure 'mobile' and '_archive' are in the root directory."
Write-Host "2. If 'mobile' failed to move, close VS Code and run this script again."
Write-Host "3. Once correct, run:"
Write-Host "   git add ."
Write-Host "   git commit -m 'chore: restructure project layout'"
Write-Host "   git push origin main"
Write-Host "---------------------------------------------------"
