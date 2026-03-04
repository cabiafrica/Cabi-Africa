import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/scheduled_trips_screen.dart';
import 'package:passenger_app/services/ride_service.dart';
import 'package:passenger_app/providers/providers.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:passenger_app/services/ride_service.dart';
import 'package:passenger_app/providers/providers.dart';

class MockRideService extends RideService {
  @override
  Future<List<Map<String, dynamic>>> getScheduledRides() async {
    return [
      {
        'destination': 'Two Rivers Mall',
        'pickupTime':
            DateTime.now().add(const Duration(days: 1)).toIso8601String(),
      }
    ];
  }
}

class MockRideService extends RideService {
  @override
  Future<List<Map<String, dynamic>>> getScheduledRides() async {
    return [
      {
        'destination': 'Two Rivers Mall',
        'pickupTime':
            DateTime.now().add(const Duration(days: 1)).toIso8601String(),
      }
    ];
  }
}

void main() {
  testWidgets('ScheduledTripsScreen displays mock scheduled ride', (
    WidgetTester tester,
  ) async {
    // Set up a mock for SharedPreferences to be empty
    SharedPreferences.setMockInitialValues({});

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          rideServiceProvider.overrideWithValue(MockRideService()),
        ],
        child: const MaterialApp(home: ScheduledTripsScreen()),
      ),
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
