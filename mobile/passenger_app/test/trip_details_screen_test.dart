import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/trip_details_screen.dart';

void main() {
  testWidgets('TripDetailsScreen displays route and financial breakdown', (
    WidgetTester tester,
  ) async {
    final mockTrip = {
      'date': '2024-06-02 14:30',
      'destination': 'Nairobi CBD',
      'fare': 'KES 1000',
    };

    await tester.pumpWidget(
      MaterialApp(home: TripDetailsScreen(trip: mockTrip)),
    );

    // Verify Map Placeholder
    expect(find.text('Route Map Placeholder'), findsOneWidget);

    // Verify Addresses
    expect(find.text('Nairobi CBD'), findsOneWidget);
    expect(find.text('123 Mock Pickup St'), findsOneWidget); // Mocked pickup

    // Verify Financials (18% Statutory NTSA Cap)
    // Fare: 1000
    // Fee: 180 (18%)
    // Earnings: 820 (82%)
    expect(find.text('Total Fare'), findsOneWidget);
    expect(find.text('KES 1000.00'), findsOneWidget);

    expect(find.text('Platform Fee (18%)'), findsOneWidget);
    expect(find.text('- KES 180.00'), findsOneWidget);

    expect(find.text('Your Earnings'), findsOneWidget);
    expect(find.text('KES 820.00'), findsOneWidget);
  });
}
