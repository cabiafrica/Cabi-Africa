# Dual App Preview Guide - Cabi Africa

This guide will help you run both the Driver and Passenger apps simultaneously on separate Android emulators.

## Prerequisites
✅ Two AVDs detected:
- `Pixel_6` (for Driver app)
- `Pixel_6_Passenger` (for Passenger app)

## Quick Start - Method 1: Using Android Studio

### Step 1: Launch Android Studio
1. Open **Android Studio**
2. Go to **Tools → Device Manager** (or click the device icon in the toolbar)

### Step 2: Start Both Emulators
1. In Device Manager, find `Pixel_6` and click the ▶️ (Play) button
2. Wait for it to fully boot (you'll see the Android home screen)
3. Find `Pixel_6_Passenger` and click the ▶️ (Play) button
4. Wait for it to fully boot

Both emulators should now be running side-by-side.

### Step 3: Run the Apps

#### Option A: Using Two Android Studio Windows
1. **First Window - Driver App:**
   - File → Open → Navigate to `d:\IBN\PROJECTS\Cabi Africa\mobile\driver_app`
   - In the device dropdown (top toolbar), select `Pixel_6`
   - Click Run ▶️ (or press Shift+F10)

2. **Second Window - Passenger App:**
   - Open a new Android Studio window
   - File → Open → Navigate to `d:\IBN\PROJECTS\Cabi Africa\mobile\passenger_app`
   - In the device dropdown, select `Pixel_6_Passenger`
   - Click Run ▶️ (or press Shift+F10)

#### Option B: Using Command Line (Recommended for Quick Testing)
Open **two separate PowerShell/Terminal windows**:

**Terminal 1 - Driver App:**
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa\mobile\driver_app"
flutter run -d Pixel_6
```

**Terminal 2 - Passenger App:**
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa\mobile\passenger_app"
flutter run -d Pixel_6_Passenger
```

> **Note:** If the device names don't match exactly, run `flutter devices` first to see the exact device IDs, then use those IDs with the `-d` flag.

## Quick Start - Method 2: Using PowerShell Script

I've created a helper script `launch_both_apps.ps1` that you can run to automate the process.

### Usage:
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa"
.\launch_both_apps.ps1
```

This script will:
1. Check if both emulators are running
2. Provide instructions to launch them if not
3. Run both apps on their respective emulators

## Troubleshooting

### Emulators not showing in `flutter devices`
1. Make sure both emulators are fully booted (you should see the Android home screen)
2. Run `flutter devices` to verify they're detected
3. Wait a few seconds and try again

### "No devices found" error
- Ensure Android Studio's Device Manager shows both emulators as "Running"
- Try running `adb devices` to check if ADB can see them
- If needed, restart ADB: `adb kill-server` then `adb start-server`

### App won't install or crashes
- Make sure you've run `flutter pub get` in both app directories
- Check that both apps build successfully: `flutter build apk --debug`
- Clear app data from the emulator if needed

### Performance issues (slow/laggy)
- Close unnecessary applications to free up RAM
- Reduce emulator graphics settings in AVD Manager
- Consider using physical devices instead of emulators

## Stopping the Apps

### From Command Line:
- Press `q` in the terminal running the app, or
- Press `Ctrl+C` to force stop

### From Android Studio:
- Click the Stop button (■) in the toolbar

## Tips for Testing

1. **Hot Reload:** Press `r` in the terminal to hot reload changes without restarting
2. **Hot Restart:** Press `R` for a full restart
3. **Device Logs:** Use `flutter logs` in a separate terminal to see real-time logs
4. **Debugging:** Use Android Studio's debugger for breakpoints and step-through debugging

## Next Steps

Once both apps are running:
- Test driver-passenger interactions
- Verify real-time updates between apps
- Test ride booking flow from both perspectives
- Check map synchronization
- Verify notifications and alerts
