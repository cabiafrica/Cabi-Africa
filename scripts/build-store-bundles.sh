#!/bin/bash
# ==============================================================================
# CABI AFRICA - PRODUCTION GOOGLE PLAY APP BUNDLE (.AAB) BUILDER
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/dist/mobile/bundles"
mkdir -p "$OUTPUT_DIR"

# Locate Flutter
if command -v flutter &> /dev/null; then
    FLUTTER_CMD="flutter"
elif [ -f "$HOME/Developer/flutter/bin/flutter" ]; then
    FLUTTER_CMD="$HOME/Developer/flutter/bin/flutter"
elif [ -f "/Users/user/Developer/flutter/bin/flutter" ]; then
    FLUTTER_CMD="/Users/user/Developer/flutter/bin/flutter"
else
    echo "❌ Flutter not found in PATH or ~/Developer/flutter/bin/flutter"
    exit 1
fi

echo "============================================================"
echo "   🚀 CABI AFRICA - COMPILING PLAY STORE APP BUNDLES (.AAB) "
echo "============================================================"
echo "Flutter Binary: $FLUTTER_CMD"
echo ""

# ------------------------------------------------------------------------------
# 1. BUILD CABI GO (PASSENGER APP)
# ------------------------------------------------------------------------------
echo "📦 [1/2] Building CABI Go (Passenger App) [africa.cabi.passenger]..."
cd "$PROJECT_ROOT/mobile/passenger_app"
$FLUTTER_CMD pub get
$FLUTTER_CMD build appbundle --release --dart-define=IS_PRODUCTION=true

PASSENGER_AAB="$PROJECT_ROOT/mobile/passenger_app/build/app/outputs/bundle/release/app-release.aab"
if [ -f "$PASSENGER_AAB" ]; then
    cp "$PASSENGER_AAB" "$OUTPUT_DIR/Cabi-Go-Passenger-v1.2.0.aab"
    echo "✅ CABI Go Bundle Ready: $OUTPUT_DIR/Cabi-Go-Passenger-v1.2.0.aab"
else
    echo "❌ CABI Go AAB build failed to produce expected output."
    exit 1
fi

echo ""
# ------------------------------------------------------------------------------
# 2. BUILD CABI DRIVE (DRIVER APP)
# ------------------------------------------------------------------------------
echo "📦 [2/2] Building CABI Drive (Driver App) [africa.cabi.driver]..."
cd "$PROJECT_ROOT/mobile/driver_app"
$FLUTTER_CMD pub get
$FLUTTER_CMD build appbundle --release --dart-define=IS_PRODUCTION=true

DRIVER_AAB="$PROJECT_ROOT/mobile/driver_app/build/app/outputs/bundle/release/app-release.aab"
if [ -f "$DRIVER_AAB" ]; then
    cp "$DRIVER_AAB" "$OUTPUT_DIR/Cabi-Drive-v1.2.0.aab"
    echo "✅ CABI Drive Bundle Ready: $OUTPUT_DIR/Cabi-Drive-v1.2.0.aab"
else
    echo "❌ CABI Drive AAB build failed to produce expected output."
    exit 1
fi

echo ""
echo "============================================================"
echo "🎉 ALL PLAY STORE BUNDLES COMPILED SUCCESSFULLY!"
echo "============================================================"
echo "Files ready for Google Play Console upload:"
ls -lh "$OUTPUT_DIR"
echo "============================================================"
