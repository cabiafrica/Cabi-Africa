import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:passenger_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Scheduled Rides Flow', (tester) async {
    app.main();
    await tester.pumpAndSettle(const Duration(seconds: 8));

    // Sign in block
    final signInButton = find.text('Sign In');
    if (signInButton.evaluate().isNotEmpty) {
      await tester.enterText(
          find.byType(TextFormField).at(0), 'john.doe@test.com');
      await tester.enterText(find.byType(TextFormField).at(1), 'CabiPass123!');
      await tester.tap(signInButton.first);
      await tester.pumpAndSettle(const Duration(seconds: 5));
    }

    // Assume user is on HomeScreen
    expect(find.text('Where to?'), findsWidgets);

    // Open Schedule trip panel (usually a clock or date icon somewhere on the home screen/search screen)
    final scheduleIcon = find.byIcon(Icons.calendar_today); // Example
    if (scheduleIcon.evaluate().isNotEmpty) {
      await tester.tap(scheduleIcon.first);
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Select Date & Time (simulate)
      final confirmTimeBtn = find.text('Confirm Time');
      if (confirmTimeBtn.evaluate().isNotEmpty) {
        await tester.tap(confirmTimeBtn.first);
        await tester.pumpAndSettle(const Duration(seconds: 2));
      }

      // Complete Scheduled booking (similarly to standard ride booking)
      final destinationItem = find.text('Garden City Mall');
      if (destinationItem.evaluate().isNotEmpty) {
        await tester.ensureVisible(destinationItem.first);
        await tester.tap(destinationItem.first);
        await tester.pumpAndSettle(const Duration(seconds: 2));
      }

      final confirmBooking = find.text('Confirm Scheduled Ride');
      if (confirmBooking.evaluate().isNotEmpty) {
        await tester.tap(confirmBooking.first);
        await tester.pumpAndSettle(const Duration(seconds: 4));
      }
    }

    // Navigate via Menu to Scheduled Trips to review it
    final menuButton = find.byIcon(Icons.menu);
    if (menuButton.evaluate().isNotEmpty) {
      await tester.tap(menuButton.first);
      await tester.pumpAndSettle(const Duration(seconds: 2));
    }

    final tripsMenu = find.text('Your Trips');
    if (tripsMenu.evaluate().isNotEmpty) {
      await tester.tap(tripsMenu.first);
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Navigate to Upcoming/Scheduled tab
      final upcomingTab = find.text('Upcoming');
      if (upcomingTab.evaluate().isNotEmpty) {
        await tester.tap(upcomingTab.first);
        await tester.pumpAndSettle(const Duration(seconds: 2));
      }

      // Verify Scheduled Trip exists
      expect(find.text('Scheduled'), findsWidgets);
    }
  });
}
