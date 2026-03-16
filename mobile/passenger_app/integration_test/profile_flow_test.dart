import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:passenger_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Profile update and management flow', (tester) async {
    // --- Pre-seed auth token so login is skipped ---
    debugPrint("[TEST] Seeding auth token...");
    const storage = FlutterSecureStorage();
    await storage.write(key: 'authToken', value: 'test_token_for_integration');

    debugPrint("[TEST] Starting application...");
    await app.main();

    debugPrint("[TEST] Waiting for Splash Screen transition...");
    // Pump enough to cover the 2s animation + 5s auto-login timeout
    for (int i = 0; i < 12; i++) {
      await tester.pump(const Duration(seconds: 1));
    }

    // After splash, we should be on HomeScreen (token was set above).
    // Verify we're NOT on login screen.
    final isLogin = find.text('Sign In').evaluate().isNotEmpty;
    if (isLogin) {
      debugPrint(
          "[TEST] WARNING: Still on LoginScreen. Seeded token may have been ignored.");
      debugDumpApp();
      fail("Expected HomeScreen after token seed but found LoginScreen.");
    }
    debugPrint("[TEST] HomeScreen confirmed.");

    // --- Step 2: Open Menu ---
    debugPrint("[TEST] Opening Menu...");
    final menuIcon = find.byIcon(Icons.menu);
    expect(menuIcon, findsWidgets,
        reason: "Menu icon (FAB) should be visible on HomeScreen");
    await tester.tap(menuIcon.first);
    await tester.pump(const Duration(seconds: 2));

    // --- Step 3: Navigate to Profile ---
    debugPrint("[TEST] Tapping Profile in Menu...");
    final jane = find.text('Jane Doe');
    expect(jane, findsWidgets,
        reason: "Jane Doe header must be visible in MenuScreen");
    await tester.tap(jane.first);
    await tester.pump(const Duration(seconds: 2));

    // --- Step 4: Verify Profile Screen ---
    debugPrint("[TEST] Verifying Profile Screen...");
    expect(
      find.textContaining(RegExp('PROFILE', caseSensitive: false)),
      findsWidgets,
      reason: "Profile screen title should contain 'PROFILE'",
    );

    // --- Step 5: Update name ---
    debugPrint("[TEST] Updating name...");
    final nameFields = find.byType(TextFormField);
    debugPrint(
        "[TEST] # TextFormFields on Profile = ${nameFields.evaluate().length}");
    await tester.enterText(nameFields.at(0), 'Jane Updated');
    await tester.pump(const Duration(milliseconds: 500));

    // Dismiss keyboard
    await tester.tapAt(const Offset(200, 50));
    await tester.pump(const Duration(milliseconds: 300));

    // --- Step 6: Save ---
    debugPrint("[TEST] Saving...");
    final save = find.text('SAVE');
    expect(save, findsWidgets, reason: "SAVE button must be visible");
    await tester.tap(save.first);
    await tester.pump(const Duration(seconds: 2));

    // Check for snackbar / success message
    final successMsg =
        find.textContaining(RegExp('success', caseSensitive: false));
    if (successMsg.evaluate().isNotEmpty) {
      debugPrint("[TEST] Success message found.");
    } else {
      debugPrint("[TEST] WARNING: No success snackbar visible.");
    }

    // --- Step 7: Navigate to Rewards ---
    debugPrint("[TEST] Navigating to Rewards...");
    final rewardsLink =
        find.textContaining(RegExp('CABI Rewards', caseSensitive: false));
    if (rewardsLink.evaluate().isEmpty) {
      // try a broader search
      final anyRewards =
          find.textContaining(RegExp('rewards', caseSensitive: false));
      debugPrint(
          "[TEST] Rewards link candidates: ${anyRewards.evaluate().length}");
      expect(anyRewards, findsWidgets,
          reason: "Should find a Rewards link on Profile screen");
      await tester.tap(anyRewards.first);
    } else {
      await tester.tap(rewardsLink.first);
    }
    await tester.pump(const Duration(seconds: 2));
    expect(
      find.textContaining(RegExp('loyalty|rewards', caseSensitive: false)),
      findsWidgets,
      reason: "Should be on Rewards/Loyalty screen",
    );

    // --- Step 8: Go back ---
    debugPrint("[TEST] Going back to Profile...");
    await tester.pageBack();
    await tester.pump(const Duration(seconds: 2));

    // --- Step 9: Logout ---
    debugPrint("[TEST] Logging out...");
    final logout = find.textContaining(
        RegExp('TERMINATE|Sign Out|Logout', caseSensitive: false));
    expect(logout, findsWidgets, reason: "Logout button must exist");
    // Scroll into view before tapping (button may be below the fold)
    await tester.ensureVisible(logout.first);
    await tester.pump(const Duration(milliseconds: 500));
    await tester.tap(logout.first);
    await tester.pump(const Duration(seconds: 5));

    // --- Step 10: Verify Login Screen ---
    expect(find.text('Sign In'), findsOneWidget,
        reason: "Should land on Login screen after logout");
    debugPrint("[TEST] SUCCESS! All steps passed.");
  });
}
