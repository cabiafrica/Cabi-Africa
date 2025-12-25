import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/scheduled_trips_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  testWidgets('ScheduledTripsScreen displays mock scheduled ride', (
    WidgetTester tester,
  ) async {
    // Set up a mock for SharedPreferences to be empty
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: ScheduledTripsScreen())),
    );

    // Show loading indicator initially
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Wait for the FutureBuilder to resolve
    await tester.pumpAndSettle();

    // Verify the screen title and mock data
    expect(find.text('My Scheduled Rides'), findsOneWidget);
    expect(find.text('To: Two Rivers Mall'), findsOneWidget);
  });
}
