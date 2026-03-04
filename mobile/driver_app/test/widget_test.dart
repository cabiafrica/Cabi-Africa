// Application Smoke Tests
//
// These tests verify that core screens render without uncaught exceptions.
// We deliberately test individual screens rather than the full app (CabiDriverApp),
// because CabiDriverApp → SplashScreen creates a Future.delayed(3s) timer
// in initState which cannot be cleanly disposed in a widget test.
//
// To test that SplashScreen completes properly, we advance the fake clock past
// its 3-second timer with tester.pump(const Duration(seconds: 4)).

import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/screens/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  // ── SplashScreen ─────────────────────────────────────────────────────────
  testWidgets('SplashScreen renders logo and app name', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: SplashScreen()),
      ),
    );

    // Initial frame — logo visible
    expect(find.text('CABI DRIVE'), findsOneWidget);
    expect(find.text('B Y   C A B I   A F R I C A'), findsOneWidget);

    // Advance past the 3-second Future.delayed to let initState complete.
    // This drains the pending timer so the test teardown assertion passes.
    await tester.pump(const Duration(seconds: 4));

    // After navigation attempt — the widget tree transitions, no exception thrown
    expect(find.byType(SplashScreen).evaluate(), anyElement(isNotNull));
  });

  // ── LoginScreen ───────────────────────────────────────────────────────────
  testWidgets('LoginScreen renders form fields', (tester) async {
    tester.view.physicalSize = const Size(1080, 4000);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: LoginScreen()),
      ),
    );
    await tester.pumpAndSettle();

    // Login screen should show at least one form field
    expect(find.byType(LoginScreen), findsOneWidget);
    expect(find.byType(TextFormField), findsAny);
  });
}
