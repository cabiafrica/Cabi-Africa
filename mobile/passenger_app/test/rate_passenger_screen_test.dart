import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/rate_passenger_screen.dart';

void main() {
  testWidgets('RatePassengerScreen updates rating and submits', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(home: RatePassengerScreen(rideId: 'ride-123')),
    );

    // Verify initial state (5 stars default)
    expect(find.text('How was your passenger?'), findsOneWidget);
    expect(find.text('5 Stars'), findsOneWidget);

    // Find star icons (Icons.star)
    // Initially 5 filled stars
    expect(find.byIcon(Icons.star), findsNWidgets(5));

    // Tap the 3rd star (index 2)
    // We need to find the specific IconButton. Since they are identical except for state,
    // we can find by type and tap the 3rd one.
    final stars = find.byType(IconButton);
    await tester.tap(stars.at(2));
    await tester.pump();

    // Verify rating updated to 3
    expect(find.text('3 Stars'), findsOneWidget);
    expect(find.byIcon(Icons.star), findsNWidgets(3));
    expect(find.byIcon(Icons.star_border), findsNWidgets(2));

    // Enter comment
    await tester.enterText(find.byType(TextField), 'Great passenger!');

    // Tap submit
    await tester.tap(find.text('Submit Rating'));
    await tester.pump(); // Start submission (loading)
    await tester.pump(const Duration(seconds: 1)); // Finish mock submission
    await tester.pumpAndSettle(); // Navigation

    // Verify success snackbar
    expect(find.text('Rating submitted. Thank you!'), findsOneWidget);
  });
}
