import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:driver_app/screens/home_screen.dart';
import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/services/location_service.dart';
import 'package:geolocator/geolocator.dart';

class MockRideService extends Mock implements RideService {}

class MockLocationService extends Mock implements LocationService {}

void main() {
  late MockRideService mockRideService;
  late MockLocationService mockLocationService;

  setUp(() {
    mockRideService = MockRideService();
    mockLocationService = MockLocationService();

    // Default mock behaviors
    when(() => mockRideService.getCurrentRide(any(), any()))
        .thenAnswer((_) async => null);
    when(() => mockLocationService.getCurrentLocation())
        .thenAnswer((_) async => Position(
              latitude: -1.286389,
              longitude: 36.817223,
              timestamp: DateTime.now(),
              accuracy: 0.0,
              altitude: 0.0,
              heading: 0.0,
              speed: 0.0,
              speedAccuracy: 0.0,
              altitudeAccuracy: 0.0,
              headingAccuracy: 0.0,
            ));
  });

  Widget createHomeScreen() {
    return ProviderScope(
      overrides: [
        rideServiceProvider.overrideWithValue(mockRideService),
      ],
      child: const MaterialApp(
        home: HomeScreen(),
      ),
    );
  }

  testWidgets('HomeScreen toggle online/offline status', (tester) async {
    await tester.pumpWidget(createHomeScreen());
    await tester.pumpAndSettle();

    // Initially Offline
    expect(find.text('OFFLINE'), findsOneWidget);
    expect(find.text('Go Online'), findsOneWidget);

    // Toggle Online
    await tester.tap(find.text('Go Online'));

    // Wait for the simulated network delay in `_toggleOnline`
    await tester.pumpAndSettle();

    expect(find.text('ONLINE'), findsOneWidget);
    expect(find.text('Go Offline'), findsOneWidget);

    // Cleanup to stop the timer
    await tester.tap(find.text('Go Offline')); // Go offline
    await tester.pumpAndSettle();
  });
}
