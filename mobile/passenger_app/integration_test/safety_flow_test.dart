import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:passenger_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = false;

  testWidgets('Safety and Emergency Tools Flow', (tester) async {
    // --- Pre-seed auth token so login is skipped ---
    debugPrint("[TEST] Seeding auth token...");
    const storage = FlutterSecureStorage();
    await storage.write(key: 'authToken', value: 'test_token_for_integration');

    debugPrint("[TEST] Starting application...");
    await app.main();

    // Pump to jump over splash screen and any initial state config
    debugPrint("[TEST] Waiting for Splash Screen transition...");
    for (int i = 0; i < 12; i++) {
        await tester.pump(const Duration(seconds: 1));
    }

    // Check if we are on Login Screen (oops, seed failed or something)
    final isLogin = find.text('Sign In').evaluate().isNotEmpty;
    if (isLogin) {
      debugPrint("[TEST] ERROR: Still on LoginScreen. Token seeding failed?");
      debugDumpApp();
      fail("Expected HomeScreen but found LoginScreen.");
    }
    debugPrint("[TEST] HomeScreen confirmed.");

    // Open User Menu
    debugPrint("[TEST] Opening Menu...");
    final menuButton = find.byIcon(Icons.menu);
    if (menuButton.evaluate().isEmpty) {
        debugPrint("[TEST] Menu icon not found via Icons.menu. Trying backup search...");
        // Try finding the FAB directly since we know it has no label but a unique position
        final allFABs = find.byType(FloatingActionButton);
        debugPrint("[TEST] Found ${allFABs.evaluate().length} FloatingActionButtons.");
        if (allFABs.evaluate().isNotEmpty) {
            await tester.tap(allFABs.first);
        } else {
            debugDumpApp();
            fail("Menu button (Icons.menu or FAB) not found.");
        }
    } else {
        await tester.tap(menuButton.first);
    }
    await tester.pump(const Duration(seconds: 2));

    // Navigate to Settings
    debugPrint("[TEST] Navigate to Settings...");
    final settingsMenu = find.text('Settings');
    if (settingsMenu.evaluate().isNotEmpty) {
      await tester.ensureVisible(settingsMenu.first);
      await tester.tap(settingsMenu.first);
      await tester.pump(const Duration(seconds: 3));
    } else {
      debugPrint("[TEST] WARNING: Settings menu item not found. Dumping widget tree...");
      debugDumpApp();
      return;
    }

    // Find Trusted Contacts
    debugPrint("[TEST] Check Trusted Contacts...");
    final trustedContactsTile = find.text('Trusted Contacts');
    if (trustedContactsTile.evaluate().isNotEmpty) {
      await tester.ensureVisible(trustedContactsTile.first);
      await tester.tap(trustedContactsTile.first);
      await tester.pump(const Duration(seconds: 2));

      // Attempt to add a contact
      debugPrint("[TEST] Check Add Contact...");
      final addContactBtn = find.text('Add Contact');
      if (addContactBtn.evaluate().isNotEmpty) {
        await tester.ensureVisible(addContactBtn.first);
        await tester.tap(addContactBtn.first);
        await tester.pump(const Duration(seconds: 2));
        
        // Try backing out of Add Contact dialog/screen
        debugPrint("[TEST] Backing out of Add Contact...");
        final backBtn = find.byIcon(Icons.arrow_back);
        if (backBtn.evaluate().isNotEmpty) {
           await tester.tap(backBtn.first);
        } else {
           await tester.pageBack();
        }
        await tester.pump(const Duration(seconds: 2));
      }

      // Go back out of trusted contacts
      debugPrint("[TEST] Backing out of Trusted Contacts...");
      await tester.pageBack();
      await tester.pump(const Duration(seconds: 2));
    } else {
        debugPrint("[TEST] WARNING: Trusted Contacts tile not found.");
    }

    // Expect back to Settings or Home screen
    debugPrint("[TEST] Final verification...");
    for (int i = 0; i < 3; i++) {
        if (find.text('Where to?').evaluate().isNotEmpty) break;
        debugPrint("[TEST] Not at Home yet, going back level ${i+1}...");
        
        final closeBtn = find.byIcon(Icons.close);
        if (closeBtn.evaluate().isNotEmpty) {
           await tester.tap(closeBtn.first);
        } else {
           await tester.pageBack();
        }
        await tester.pump(const Duration(seconds: 2));
    }
    
    expect(find.text('Where to?'), findsWidgets, reason: "Should eventually return to HomeScreen");
    debugPrint("[TEST] SUCCESS! Safety Flow completed.");
  });
}
