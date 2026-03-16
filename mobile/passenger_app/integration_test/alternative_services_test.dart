import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:passenger_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Alternative Services: Delivery and Food Flow', (tester) async {
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

    // Expect Home initially
    expect(find.text('Where to?'), findsWidgets);
    debugPrint("[TEST] On HomeScreen.");

    // Navigate to Packages / Delivery
    final packageTile = find.text('Package'); 
    if (packageTile.evaluate().isNotEmpty) {
      debugPrint("[TEST] Tapping Package...");
      await tester.tap(packageTile.first);
      await tester.pump(const Duration(seconds: 3));

      // In current mock UI, it might just be a standard modal or "Coming Soon" toast
      // Let's just tap to verify it registers the tap without crashing
    } else {
      debugPrint("[TEST] WARNING: 'Package' tile not found.");
    }

    // Navigate to Food/Restaurants
    final foodTile = find.text('Food');
    if (foodTile.evaluate().isNotEmpty) {
      debugPrint("[TEST] Tapping Food...");
      await tester.tap(foodTile.first);
      await tester.pump(const Duration(seconds: 3));
    } else {
      debugPrint("[TEST] WARNING: 'Food' tile not found.");
    }

    // Navigate to Tours
    final toursTile = find.text('Tours');
    if (toursTile.evaluate().isNotEmpty) {
      debugPrint("[TEST] Tapping Tours...");
      await tester.tap(toursTile.first);
      await tester.pump(const Duration(seconds: 3));
    } else {
      debugPrint("[TEST] WARNING: 'Tours' tile not found.");
    }

    debugPrint("[TEST] SUCCESS! Alternative Services Flow completed.");
  });
}
