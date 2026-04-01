# 🚀 Quick Start - Run Both Apps

## Method 1: Automated (Easiest) ⚡

### 1️⃣ Start Emulators in Android Studio
```
Android Studio → Tools → Device Manager
▶️ Click Play on "Pixel_6"
▶️ Click Play on "Pixel_6_Passenger"
```

### 2️⃣ Run the Script
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa"
.\launch_both_apps.ps1
```

### 3️⃣ Select Devices
- Driver terminal → Choose Pixel_6
- Passenger terminal → Choose Pixel_6_Passenger

✅ **Done!**

---

## Method 2: Manual Command Line 🔧

### Open 2 PowerShell Windows

**Window 1 - Driver:**
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa\mobile\driver_app"
flutter run
```

**Window 2 - Passenger:**
```powershell
cd "d:\IBN\PROJECTS\Cabi Africa\mobile\passenger_app"
flutter run
```

---

## Useful Commands 💡

| Command | Action |
|---------|--------|
| `r` | Hot reload |
| `R` | Hot restart |
| `q` | Quit app |
| `Ctrl+C` | Force stop |
| `flutter devices` | List devices |

---

## Troubleshooting 🔍

**No devices found?**
→ Make sure emulators are fully booted (see Android home screen)

**Need help?**
→ See [DUAL_APP_PREVIEW_GUIDE.md](file:///d:/IBN/PROJECTS/Cabi%20Africa/DUAL_APP_PREVIEW_GUIDE.md)
