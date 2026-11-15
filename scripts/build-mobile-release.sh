#!/usr/bin/env bash
# ==============================================================================
# CABI AFRICA - MOBILE PRODUCTION RELEASE BUILDER (BASH)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$ROOT_DIR/dist/mobile"
PORTAL_DOWNLOADS_DIR="$ROOT_DIR/web/user_portal/public/downloads"
APKS_DIR="$ROOT_DIR/apks"

if [ -d "/Users/user/Developer/flutter/bin" ]; then
    export PATH="/Users/user/Developer/flutter/bin:$PATH"
fi

echo "============================================================"
echo "   🚀 CABI AFRICA - MOBILE RELEASE BUILD PIPELINE (PROD)    "
echo "============================================================"

mkdir -p "$DIST_DIR" "$PORTAL_DOWNLOADS_DIR" "$APKS_DIR"

DART_DEFINES="--android-skip-build-dependency-validation --target-platform android-arm,android-arm64 --dart-define=IS_PRODUCTION=true --no-tree-shake-icons"

# 1. Passenger App
echo -e "\n📱 Building Cabi Go (Passenger App) [Application ID: africa.cabi.passenger]..."
cd "$ROOT_DIR/mobile/passenger_app"
flutter pub get
flutter build apk --release $DART_DEFINES
if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
    cp "build/app/outputs/flutter-apk/app-release.apk" "$DIST_DIR/Cabi-Go-Production.apk"
    cp "build/app/outputs/flutter-apk/app-release.apk" "$DIST_DIR/Cabi-Go-Official.apk"
    cp "build/app/outputs/flutter-apk/app-release.apk" "$PORTAL_DOWNLOADS_DIR/Cabi-Go-Official.apk"
    cp "build/app/outputs/flutter-apk/app-release.apk" "$APKS_DIR/cabi_passenger_app.apk"
    echo "✅ Passenger APK ready: $PORTAL_DOWNLOADS_DIR/Cabi-Go-Official.apk"
fi

if [[ "$1" == "--bundle" || "$1" == "-b" ]]; then
    flutter build appbundle --release $DART_DEFINES
    if [ -f "build/app/outputs/bundle/release/app-release.aab" ]; then
        cp "build/app/outputs/bundle/release/app-release.aab" "$DIST_DIR/Cabi-Go-Production.aab"
        echo "✅ Passenger AAB ready: $DIST_DIR/Cabi-Go-Production.aab"
    fi
fi

# 2. Driver App
echo -e "\n🚖 Building Cabi Drive (Driver App) [Application ID: africa.cabi.driver]..."
cd "$ROOT_DIR/mobile/driver_app"
flutter pub get
flutter build apk --release $DART_DEFINES
if [ -f "build/app/outputs/flutter-apk/app-release.apk" ]; then
    cp "build/app/outputs/flutter-apk/app-release.apk" "$DIST_DIR/Cabi-Drive-Production.apk"
    cp "build/app/outputs/flutter-apk/app-release.apk" "$DIST_DIR/Cabi-Drive-Official.apk"
    cp "build/app/outputs/flutter-apk/app-release.apk" "$PORTAL_DOWNLOADS_DIR/Cabi-Drive-Official.apk"
    cp "build/app/outputs/flutter-apk/app-release.apk" "$APKS_DIR/cabi_driver_app.apk"
    echo "✅ Driver APK ready: $PORTAL_DOWNLOADS_DIR/Cabi-Drive-Official.apk"
fi

if [[ "$1" == "--bundle" || "$1" == "-b" ]]; then
    flutter build appbundle --release $DART_DEFINES
    if [ -f "build/app/outputs/bundle/release/app-release.aab" ]; then
        cp "build/app/outputs/bundle/release/app-release.aab" "$DIST_DIR/Cabi-Drive-Production.aab"
        echo "✅ Driver AAB ready: $DIST_DIR/Cabi-Drive-Production.aab"
    fi
fi

echo -e "\n🎉 Production Release Build Finished!"
echo "Artifacts written to: $DIST_DIR"
