import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:passenger_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Wallet and Payment Flow', (tester) async {
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

    // Expect to be on Home screen
    expect(find.text('Where to?'), findsWidgets);
    
    // Open User Menu
    debugPrint("[TEST] Opening Menu...");
    final menuButton = find.byIcon(Icons.menu);
    expect(menuButton, findsWidgets, reason: "Menu must be accessible from Home Screen");
    await tester.tap(menuButton.first);
    await tester.pump(const Duration(seconds: 2));

    // Navigate to Wallet via Menu
    debugPrint("[TEST] Tapping Wallet...");
    final walletMenu = find.text('Wallet');
    expect(walletMenu, findsWidgets, reason: "Wallet item must be in Sidebar");
    await tester.tap(walletMenu.first);
    await tester.pump(const Duration(seconds: 3));

    // Expect to be on Wallet screen
    expect(find.textContaining(RegExp('WALLET', caseSensitive: false)), findsWidgets);

    // Verify Balance UI is present
    expect(find.textContaining(RegExp('Current Balance|Balance', caseSensitive: false)), findsWidgets);

    // Navigate to Add Payment Method
    debugPrint("[TEST] Tapping Add Payment Method...");
    final addPaymentBtn = find.textContaining(RegExp('Add Payment Method', caseSensitive: false));
    if (addPaymentBtn.evaluate().isNotEmpty) {
      await tester.ensureVisible(addPaymentBtn.first);
      await tester.tap(addPaymentBtn.first);
      await tester.pump(const Duration(seconds: 2));

      // Simulate going back
      debugPrint("[TEST] Going back...");
      await tester.pageBack();
      await tester.pump(const Duration(seconds: 2));
    }

    debugPrint("[TEST] SUCCESS! Wallet flow completed.");
  });
}
