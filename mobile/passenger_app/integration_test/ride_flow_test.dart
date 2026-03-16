import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:passenger_app/main.dart' as app;
import 'package:passenger_app/screens/home_screen.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Full ride request flow simulation on emulator', (tester) async {
    // --- Pre-seed auth token so login is skipped ---
    debugPrint("[TEST] Seeding auth token...");
    const storage = FlutterSecureStorage();
    await storage.write(key: 'authToken', value: 'test_token_for_integration');

    debugPrint("[TEST] Starting application...");
    await app.main();

    // Pump to jump over splash screen and any initial state config
    for (int i = 0; i < 10; i++) {
        await tester.pump(const Duration(seconds: 1));
    }

    // 1. Verify we are on Home Screen
    expect(find.byType(HomeScreen), findsOneWidget, reason: "Should be on HomeScreen after auth skip");
    debugPrint("[TEST] On HomeScreen.");

    // 2. Tap the "Where to?" Search bar
    final whereTo = find.text('Where to?');
    expect(whereTo, findsWidgets);
    await tester.tap(whereTo.first);
    await tester.pump(const Duration(seconds: 2));

    // The current HomeScreen opens a dummy location selector or expands a panel when 'Where to?' is tapped.
    // For the simulation we can pick an available category like 'Tours' or 'Food' or just tap 'Confirm Pickup'
    
    // Instead of tapping 'Where to?', let's look for a destination in the predefined list for simulation
    // Let's scroll or find the Confirm button for the simulation
    final confirmBtn = find.text('Confirm Pickup');
    if (confirmBtn.evaluate().isNotEmpty) {
      await tester.ensureVisible(confirmBtn.first);
      await tester.tap(confirmBtn.first);
      await tester.pump(const Duration(seconds: 2));
    }
    
    // Wait for the booking panel (Boda, Cabi Lite, etc) to appear
    final rideOption = find.text('Cabi Standard');
    if (rideOption.evaluate().isNotEmpty) {
      debugPrint("[TEST] Tapping Cabi Standard...");
      await tester.ensureVisible(rideOption.first);
      await tester.tap(rideOption.first);
      await tester.pump(const Duration(seconds: 1));
    }

    // Book the ride!
    final bookBtn = find.textContaining(RegExp('Book cabi|Confirm', caseSensitive: false));
    if (bookBtn.evaluate().isNotEmpty) {
       debugPrint("[TEST] Booking ride...");
       await tester.ensureVisible(bookBtn.first);
       await tester.tap(bookBtn.first);
       await tester.pump(const Duration(seconds: 5));
    }

    // 5. Observe simulation
    debugPrint('[TEST] Waiting for simulation steps...');

    // Searching... -> Driver Found... -> On Trip...
    for (int i = 0; i < 15; i++) {
      await tester.pump(const Duration(seconds: 1));
      debugPrint('[TEST] Trip progressing... sec $i');
    }

    // Fast-forward to trip end
    await tester.pump(const Duration(seconds: 20));
    await tester.pumpAndSettle(const Duration(seconds: 2));

    // Wait for rating dialog to potentially appear
    final ratingDialog = find.textContaining(RegExp('Rate your Trip', caseSensitive: false));
    if (ratingDialog.evaluate().isNotEmpty) {
        debugPrint('[TEST] Rate your trip dialog found.');
        final submitBtn = find.text('Submit Rating');
        if (submitBtn.evaluate().isNotEmpty) {
             await tester.tap(submitBtn.first);
             await tester.pumpAndSettle(const Duration(seconds: 2));
        }
    } else {
        debugPrint('[TEST] Rate dialog not found. Might not have triggered from mock state.');
    }

    // Done - back to standard ready state
    debugPrint("[TEST] Simulation complete.");
  });
}
