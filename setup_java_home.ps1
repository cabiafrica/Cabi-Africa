# Setup JAVA_HOME Environment Variable
# This script helps configure JAVA_HOME if the installer didn't set it automatically

Write-Host "Searching for JDK installation..."

# Common JDK installation paths and known paths on this machine
$possiblePaths = @(
    "D:\IBN\MAD\android studio\jbr",
    "C:\Program Files\Eclipse Adoptium\jdk-17*",
    "C:\Program Files\Java\jdk-17*",
    "C:\Program Files\OpenJDK\jdk-17*",
    "C:\Program Files (x86)\Eclipse Adoptium\jdk-17*"
)

$jdkPath = $null

foreach ($path in $possiblePaths) {
    if ($path -like "*[*]*") {
        $found = Get-Item $path -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $jdkPath = $found.FullName
            break
        }
    }
    else {
        if (Test-Path $path) {
            $jdkPath = $path
            break
        }
    }
}

if ($jdkPath) {
    Write-Host "Found JDK at: $jdkPath"
    
    # Set JAVA_HOME for current user
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath, [System.EnvironmentVariableTarget]::User)
    
    # Add to PATH
    $currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)
    $javaBin = "$jdkPath\bin"
    
    if ($currentPath -notlike "*$javaBin*") {
        $newPath = "$javaBin;$currentPath"
        [System.Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::User)
        Write-Host "Added Java to PATH"
    }
    else {
        Write-Host "Java already in PATH"
    }
    
    Write-Host "JAVA_HOME configured successfully!"
    Write-Host "JAVA_HOME = $jdkPath"
    Write-Host "IMPORTANT: Close this PowerShell window and open a NEW one for changes to take effect."
    
}
else {
    Write-Host "JDK 17 or higher not found in common installation paths"
    Write-Host "Please install JDK 17 first using INSTALL_JDK.md guide"
}
