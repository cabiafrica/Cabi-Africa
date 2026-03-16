import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:passenger_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Sanity check - App launches', (tester) async {
    debugPrint("[TEST] Starting application...");
    await app.main();

    debugPrint("[TEST] Waiting for 10 seconds...");
    // Use pump with duration instead of pumpAndSettle to avoid hangs on repeating animations
    for (int i = 0; i < 10; i++) {
      await tester.pump(const Duration(seconds: 1));
    }

    final hasLogin = find.text('Sign In').evaluate().isNotEmpty;
    final hasHome = find.text('Where to?').evaluate().isNotEmpty;

    debugPrint("[TEST] State: Login=$hasLogin, Home=$hasHome");

    // Check for visibility in descendant as well if needed
    final anyText = find.byType(Text);
    debugPrint("[TEST] Found ${anyText.evaluate().length} Text widgets.");

    expect(hasLogin || hasHome, true,
        reason:
            "Should be at login or home screen. Found texts: ${anyText.evaluate().length}");
    debugPrint("[TEST] Sanity check passed!");
  });
}
