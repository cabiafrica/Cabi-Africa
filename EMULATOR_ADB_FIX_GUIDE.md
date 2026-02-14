# Emulator ADB Fix Guide - Cabi Africa

## Issue
The Android emulators show a warning: "The ADB binary found at D:\IBN\MAD\android\Sdk\platform-tools\adb.exe is obsolete and has serious performance problems with the Android Emulator."

## Current Status
- ✅ **Two Android emulators running:**
  - `emulator-5554` (Pixel_6 - for Driver app)
  - `emulator-5556` (Pixel_6_Passenger - for Passenger app)
- ✅ **Flutter apps detected:**
  - `mobile\driver_app` (Flutter + Dart)
  - `mobile\passenger_app` (Flutter + Dart)
- ⚠️ **ADB version:** 36.0.2 (showing as obsolete by emulator)

## Quick Solution Steps

### Option 1: Close and Restart Emulators (Recommended)

The simplest solution is to close the emulators and restart them:

1. **Close both emulators** (click X on emulator windows or in Android Studio Device Manager)
2. **Open Android Studio**
3. **Go to Tools → Device Manager**
4. **Start Pixel_6 emulator** (for Driver app)
5. **Start Pixel_6_Passenger emulator** (for Passenger app)
6. **Wait for both to fully boot** (you'll see the Android home screen)

The emulators should now connect properly with ADB.

### Option 2: Restart ADB Server

If the emulators are already running and you don't want to close them:

```powershell
# Navigate to project root
cd "d:\IBN\PROJECTS\Cabi Africa"

# Kill ADB server
& "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" kill-server

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start ADB server
& "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" start-server

# Verify devices are detected
& "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" devices
```

Expected output:
```
List of devices attached
emulator-5554   device
emulator-5556   device
```

### Option 3: Update Platform-Tools (If issue persists)

If you need to update to the absolute latest platform-tools:

```powershell
# Update platform-tools to latest version
& "D:\IBN\MAD\android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "platform-tools"

# Then restart ADB (see Option 2)
```

## Running Both Apps

Once the emulators are working, you can run both Flutter apps:

### Method 1: Using Flutter CLI (Recommended)

Open **two separate PowerShell windows**:

**Terminal 1 - Driver App:**
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa\mobile\driver_app"
flutter run -d emulator-5554
```

**Terminal 2 - Passenger App:**
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa\mobile\passenger_app"
flutter run -d emulator-5556
```

### Method 2: Using Device Names

If you prefer using device names instead of IDs:

**Terminal 1 - Driver App:**
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa\mobile\driver_app"
flutter devices  # List all devices and find names
flutter run -d "sdk gphone64 x86 64"  # Use exact device name from list
```

**Terminal 2 - Passenger App:**
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa\mobile\passenger_app"
flutter devices
flutter run -d "sdk gphone64 x86 64"  # Use the other emulator's name
```

### Method 3: Using Android Studio

1. **First Window - Driver App:**
   - File → Open → Navigate to `d:\IBN\PROJECTS\Cabi Africa\mobile\driver_app`
   - In device dropdown (top toolbar), select emulator-5554
   - Click Run ▶️

2. **Second Window - Passenger App:**
   - Open a new Android Studio window
   - File → Open → Navigate to `d:\IBN\PROJECTS\Cabi Africa\mobile\passenger_app`
   - In device dropdown, select emulator-5556
   - Click Run ▶️

## Troubleshooting

### "No devices found"
```powershell
# Check if emulators are detected by ADB
& "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" devices

# If empty, restart ADB server (see Option 2 above)
```

### "Device Offline"
```powershell
# Restart the specific emulator
& "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" -s emulator-5554 reboot

# Or close and cold-boot from Android Studio Device Manager
```

### ADB commands hanging
If ADB commands are hanging/freezing:
1. Open Task Manager (Ctrl+Shift+Esc)
2. Find all `adb.exe` processes and End Task
3. Start ADB server fresh:
   ```powershell
   & "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" start-server
   ```

### Emulators slow/laggy
1. Close one emulator if you only need one app at a time
2. Increase emulator RAM in Android Studio AVD settings
3. Enable hardware acceleration (should already be enabled)
4. Close unnecessary applications

## Verifying Everything Works

Once both apps are running, test:
- [ ] Both emulators show the app UI (no white screen)
- [ ] Hot reload works (press `r` in terminal)
- [ ] Driver app can update location
- [ ] Passenger app can request rides
- [ ] Real-time updates between apps
- [ ] Map functionality works

## Quick Reference Commands

```powershell
# Check ADB version
& "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" version

# List connected devices
& "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" devices

# List Flutter devices
flutter devices

# Check AVDs
& "D:\IBN\MAD\android\Sdk\cmdline-tools\latest\bin\avdmanager.bat" list avd

# Kill ADB server
& "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" kill-server

# Start ADB server
& "D:\IBN\MAD\android\Sdk\platform-tools\adb.exe" start-server
```

## Environment Variables (Current Setup)
```
ANDROID_HOME=D:\IBN\MAD\android\Sdk
ANDROID_SDK_ROOT=D:\IBN\MAD\android\Sdk
ANDROID_USER_HOME=D:\IBN\MAD
ANDROID_AVD_HOME=D:\IBN\MAD\avd
```

All properly configured! ✅
