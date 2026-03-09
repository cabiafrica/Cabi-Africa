import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:passenger_app/main.dart' as app;
import 'package:passenger_app/screens/home_screen.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Full ride request flow simulation on emulator', (tester) async {
    app.main();
    await tester.pumpAndSettle(const Duration(seconds: 8));

    // 1. Navigate to Registration
    // The "Sign Up" is a GestureDetector with a Text child
    final signUpText = find.text('Sign Up');
    await tester.ensureVisible(signUpText);
    await tester.tap(signUpText);
    await tester.pumpAndSettle(const Duration(seconds: 2));

    // 2. Fill registration
    // We use find.byType(TextFormField) or text labels since our labels are in the decoration
    await tester.enterText(find.byType(TextFormField).at(0), 'John');
    await tester.enterText(find.byType(TextFormField).at(1), 'Doe');
    await tester.enterText(
        find.byType(TextFormField).at(2), 'john.doe@test.com');
    await tester.enterText(find.byType(TextFormField).at(3), '0712345678');
    await tester.enterText(find.byType(TextFormField).at(4), 'CabiPass123!');
    await tester.enterText(find.byType(TextFormField).at(5), 'CabiPass123!');

    // Tap Register
    final registerBtn = find.text('COMPLETE REGISTRATION');
    await tester.ensureVisible(registerBtn);
    await tester.tap(registerBtn);
    await tester.pumpAndSettle(const Duration(seconds: 5));

    // 3. Login
    await tester.enterText(
        find.byType(TextFormField).at(0), 'john.doe@test.com');
    await tester.enterText(find.byType(TextFormField).at(1), 'CabiPass123!');
    await tester.tap(find.text('Sign In'));
    await tester.pumpAndSettle(const Duration(seconds: 5));

    // 4. Request Ride
    expect(find.byType(HomeScreen), findsOneWidget);

    // Select one from categories to trigger destination search
    final destinationItem = find.text('Garden City Mall');
    await tester.ensureVisible(destinationItem);
    await tester.tap(destinationItem);
    await tester.pumpAndSettle(const Duration(seconds: 2));

    // 5. Observe simulation
    print('Waiting for simulation steps...');

    // Searching...
    await tester.pump(const Duration(seconds: 5));
    // Driver Found...
    await tester.pump(const Duration(seconds: 5));
    // On Trip...

    // Observe live fare for a few seconds
    for (int i = 0; i < 5; i++) {
      await tester.pump(const Duration(seconds: 1));
      print('Trip in progress, observing fare update $i...');
    }

    // Fast-forward to trip end (30s total)
    await tester.pump(const Duration(seconds: 25));
    await tester.pumpAndSettle();

    // Verify Rating Dialog
    expect(find.text('Rate your Trip'), findsOneWidget);

    // Submit Rating
    await tester.tap(find.text('Submit Rating'));
    await tester.pumpAndSettle(const Duration(seconds: 2));

    // Done
    expect(find.text('Where to?'), findsOneWidget);
  });
}
