import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/ride_history_screen.dart';

void main() {
  testWidgets('RideHistoryScreen displays list and navigates to details', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: RideHistoryScreen()));

    // Initial loading
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Wait for mock data
    await tester.pumpAndSettle();

    // Verify list items
    expect(find.text('Westgate Mall'), findsOneWidget);
    expect(find.text('KES 450'), findsOneWidget);

    expect(find.text('JKIA Airport'), findsOneWidget);
    expect(find.text('KES 1200'), findsOneWidget);

    expect(find.text('CBD'), findsOneWidget);
    // Cancelled ride might show 0 or just status, checking status text from subtitle logic
    // Subtitle format: 'Day/Month • Status'
    expect(find.textContaining('Cancelled'), findsOneWidget);

    // Tap on first item
    await tester.tap(find.text('Westgate Mall'));
    await tester.pumpAndSettle();

    // Verify Details Screen
    expect(find.text('Ride Details'), findsOneWidget);
    expect(find.text('Westgate Mall'), findsOneWidget); // Title in details
    expect(find.text('John Doe'), findsOneWidget); // Driver name
    expect(find.text('Map Snapshot Placeholder'), findsOneWidget);

    // Verify Re-book button
    expect(find.text('Re-book Ride'), findsOneWidget);
  });
}
