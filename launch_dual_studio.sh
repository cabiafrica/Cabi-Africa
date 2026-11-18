#!/usr/bin/env bash
# ==============================================================================
# Cabi Africa — Android Studio Dual Screen Automated Launch Script (macOS)
# Launches Driver App on emulator-5554 and Passenger App on emulator-5556
# ==============================================================================

set -e

SDK_DIR="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
ADB="$SDK_DIR/platform-tools/adb"
EMULATOR="$SDK_DIR/emulator/emulator"

AVD_DRIVER="Medium_Phone_API_37.0"
AVD_PASSENGER="Medium_Phone_Passenger"

echo "=========================================================="
echo "  Cabi Africa — Dual Screen Android Studio Preview Runner "
echo "=========================================================="

if [ ! -f "$ADB" ]; then
  if command -v adb >/dev/null 2>&1; then
    ADB=$(command -v adb)
  else
    echo "❌ ADB not found at $ADB or in PATH."
    exit 1
  fi
fi

# 1. Check running devices
get_devices() {
  "$ADB" devices | grep -E "emulator-[0-9]+" | awk '{print $1}'
}

RUNNING_DEVICES=$(get_devices)
DEV_COUNT=$(echo "$RUNNING_DEVICES" | grep -v '^$' | wc -l | tr -d ' ')

echo "📱 Currently running emulators: $DEV_COUNT"

# Launch emulators detached if not already running
if [ "$DEV_COUNT" -eq 0 ]; then
  echo "🚀 Launching Driver Emulator ($AVD_DRIVER)..."
  nohup "$EMULATOR" -avd "$AVD_DRIVER" -no-snapshot-save -no-boot-anim >/dev/null 2>&1 &
  disown
  sleep 4
  echo "🚀 Launching Passenger Emulator ($AVD_PASSENGER)..."
  nohup "$EMULATOR" -avd "$AVD_PASSENGER" -no-snapshot-save -no-boot-anim >/dev/null 2>&1 &
  disown
elif [ "$DEV_COUNT" -eq 1 ]; then
  echo "🚀 Launching second emulator ($AVD_PASSENGER)..."
  nohup "$EMULATOR" -avd "$AVD_PASSENGER" -no-snapshot-save -no-boot-anim >/dev/null 2>&1 &
  disown
fi

# 2. Wait for both emulators to register on ADB
echo "⏳ Waiting for both emulators to come online..."
DRIVER_DEV=""
PASSENGER_DEV=""

for i in {1..60}; do
  DEVS=($(get_devices))
  if [ "${#DEVS[@]}" -ge 2 ]; then
    DRIVER_DEV="${DEVS[0]}"
    PASSENGER_DEV="${DEVS[1]}"
    break
  fi
  sleep 2
done

if [ -z "$PASSENGER_DEV" ]; then
  echo "⚠️ Devices detected so far:"
  "$ADB" devices
  echo "If launching in Android Studio directly, click Play on both AVDs in Device Manager."
  exit 0
fi

echo "🟢 Found Driver on $DRIVER_DEV and Passenger on $PASSENGER_DEV"

# 3. Wait for boot completion
for dev in "$DRIVER_DEV" "$PASSENGER_DEV"; do
  echo "⏳ Waiting for $dev boot completion..."
  while [ "$("$ADB" -s "$dev" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
    sleep 2
  done
done

# 4. Port forwarding & Nairobi GPS fix
echo "🔧 Configuring reverse port forwarding & Nairobi GPS..."
for dev in "$DRIVER_DEV" "$PASSENGER_DEV"; do
  for port in 3333 3334 3337 3338 3000 3010; do
    "$ADB" -s "$dev" reverse tcp:$port tcp:$port 2>/dev/null || true
  done
  # Nairobi, Kenya GPS (-1.286389, 36.817223)
  "$ADB" -s "$dev" emu geo fix 36.817223 -1.286389 2>/dev/null || true
done

# 5. Deploy Apps
echo "📦 Installing Driver App on $DRIVER_DEV..."
if [ -f "apks/cabi_driver_app.apk" ]; then
  "$ADB" -s "$DRIVER_DEV" install -r -g "apks/cabi_driver_app.apk" 2>/dev/null || true
  "$ADB" -s "$DRIVER_DEV" shell pm grant com.example.driver_app android.permission.ACCESS_FINE_LOCATION 2>/dev/null || true
  "$ADB" -s "$DRIVER_DEV" shell am start -n com.example.driver_app/.MainActivity 2>/dev/null || true
fi

echo "📦 Installing Passenger App on $PASSENGER_DEV..."
if [ -f "apks/cabi_passenger_app.apk" ]; then
  "$ADB" -s "$PASSENGER_DEV" install -r -g "apks/cabi_passenger_app.apk" 2>/dev/null || true
  "$ADB" -s "$PASSENGER_DEV" shell pm grant com.example.passenger_app android.permission.ACCESS_FINE_LOCATION 2>/dev/null || true
  "$ADB" -s "$PASSENGER_DEV" shell am start -n com.example.passenger_app/.MainActivity 2>/dev/null || true
fi

echo ""
echo "=========================================================="
echo "  ✅ Both Cabi Africa Apps Live on Dual Android Emulators!"
echo "=========================================================="
echo "👉 In Android Studio: Open 'Running Devices' tab, right-click the second tab and choose 'Split Right' to view them side-by-side."
