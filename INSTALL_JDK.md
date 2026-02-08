# 🔧 JDK 17 Installation Guide

## Why You Need This
Android Studio requires JDK 17 or higher to build Flutter Android apps. Currently, Java is not installed on your system.

---

## 📥 Step 1: Download JDK 17

### Option A: Direct Download Link (Recommended)
Click this link to download JDK 17 for Windows:

**[Download JDK 17 (Eclipse Temurin)](https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jdk_x64_windows_hotspot_17.0.13_11.msi)**

### Option B: Manual Download
1. Visit: https://adoptium.net/temurin/releases/
2. Select:
   - **Version:** 17 - LTS
   - **Operating System:** Windows
   - **Architecture:** x64
   - **Package Type:** JDK
3. Click **Download** (`.msi` file, ~180 MB)

---

## 🚀 Step 2: Install JDK

1. **Locate the downloaded file** (usually in `Downloads` folder)
   - File name: `OpenJDK17U-jdk_x64_windows_hotspot_17.0.13_11.msi`

2. **Double-click** the `.msi` file to start installation

3. **Follow the installer:**
   - Click **Next**
   - Accept the license agreement
   - **Important:** Note the installation path (default: `C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot\`)
   - Click **Install**
   - Wait for installation to complete
   - Click **Finish**

---

## ✅ Step 3: Verify Installation

### Open a NEW PowerShell window and run:
```powershell
java -version
```

**Expected output:**
```
openjdk version "17.0.13" 2024-10-15
OpenJDK Runtime Environment Temurin-17.0.13+11 (build 17.0.13+11)
OpenJDK 64-Bit Server VM Temurin-17.0.13+11 (build 17.0.13+11, mixed mode, sharing)
```

---

## 🔄 Step 4: Configure Android Studio

1. **Restart Android Studio** (important!)
2. The JDK error should disappear automatically
3. If the error persists:
   - Go to `File` → `Settings` → `Build, Execution, Deployment` → `Build Tools` → `Gradle`
   - Set **Gradle JDK** to the newly installed JDK 17
   - Click **Apply** → **OK**

---

## 🎯 Step 5: Continue with Flutter Development

Once JDK is installed and Android Studio is configured, you can proceed with:

```powershell
cd "d:\IBN\PROJECTS\Cabi Africa"
.\launch_both_apps.ps1
```

See [QUICK_START.md](file:///d:/IBN/PROJECTS/Cabi%20Africa/QUICK_START.md) for details.

---

## 🆘 Troubleshooting

### "java is not recognized" after installation
- **Close ALL PowerShell/Command Prompt windows**
- Open a **NEW** PowerShell window
- Try `java -version` again

### Installation path not found
The installer should set `JAVA_HOME` automatically. If not, run:
```powershell
.\setup_java_home.ps1
```

### Still having issues?
Check that the installation path exists:
```powershell
dir "C:\Program Files\Eclipse Adoptium\"
```
