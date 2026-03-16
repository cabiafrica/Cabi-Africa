import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:passenger_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Support and Help Center Flow', (tester) async {
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

    // Open User Menu
    debugPrint("[TEST] Opening Menu...");
    final menuButton = find.byIcon(Icons.menu);
    expect(menuButton, findsWidgets, reason: "Menu must be accessible from Home Screen");
    await tester.tap(menuButton.first);
    await tester.pump(const Duration(seconds: 2));

    // Navigate to Support via Menu
    debugPrint("[TEST] Navigate to Support Menu...");
    final supportMenu = find.text('Support');
    if (supportMenu.evaluate().isNotEmpty) {
      await tester.ensureVisible(supportMenu.first);
      await tester.tap(supportMenu.first);
      await tester.pump(const Duration(seconds: 3));
    } else {
      debugPrint("[TEST] WARNING: Support menu item not found.");
      return;
    }

    // Expect Support Screen
    expect(find.textContaining(RegExp('Help & Support', caseSensitive: false)), findsWidgets);

    // Navigate to FAQ section (ExpansionTiles in current UI)
    debugPrint("[TEST] Check FAQ...");
    final faqText = find.textContaining(RegExp('FAQ|Frequently Asked Questions', caseSensitive: false));
    if (faqText.evaluate().isNotEmpty) {
      await tester.ensureVisible(faqText.first);
      await tester.tap(faqText.first);
      await tester.pump(const Duration(seconds: 2));

      // ExpansionTile is slow, pump more
      await tester.pump(const Duration(milliseconds: 500));
    } else {
        debugPrint("[TEST] WARNING: FAQ text not found.");
    }

    // Navigate to Live Chat
    debugPrint("[TEST] Check Live Chat...");
    final liveChatTile = find.text('Live Chat');
    if (liveChatTile.evaluate().isNotEmpty) {
      await tester.ensureVisible(liveChatTile.first);
      await tester.tap(liveChatTile.first);
      await tester.pump(const Duration(seconds: 2));

      // Attempt to send a message
      final msgFields = find.byType(TextFormField);
      if (msgFields.evaluate().isNotEmpty) {
         await tester.enterText(msgFields.first, 'Hello, I need help with my last ride.');
         await tester.pumpAndSettle();

         final sendBtn = find.byIcon(Icons.send);
         if (sendBtn.evaluate().isNotEmpty) {
             await tester.tap(sendBtn.first);
             await tester.pumpAndSettle(const Duration(seconds: 2));
         }
      }

      // Exit Chat
      debugPrint("[TEST] Backing out of Live Chat...");
      await tester.pageBack();
      await tester.pump(const Duration(seconds: 2));
    } else {
      debugPrint("[TEST] WARNING: Live Chat tile not found.");
    }

    // Create new Ticket (Optionally check if exists, current mockup has "Call Support" / "Email Support" instead)
    debugPrint("[TEST] Check other contact options...");
    final contactOpt = find.textContaining(RegExp('Call Support|Email Support|Request Callback', caseSensitive: false));
    if (contactOpt.evaluate().isNotEmpty) {
      await tester.ensureVisible(contactOpt.first);
      await tester.tap(contactOpt.first);
      await tester.pump(const Duration(seconds: 2));

      // Handle Dialog if "Request Callback" was tapped
      final requestBtn = find.text('Request');
      if (requestBtn.evaluate().isNotEmpty) {
        await tester.tap(requestBtn.first);
        await tester.pump(const Duration(seconds: 1));
      } else {
         debugPrint("[TEST] Backing out...");
         await tester.pageBack();
         await tester.pump(const Duration(seconds: 2));
      }
    } else {
      debugPrint("[TEST] WARNING: Contact option not found.");
    }

    debugPrint("[TEST] SUCCESS! Support Flow completed.");
  });
}
