import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:mocktail/mocktail.dart';
import 'package:driver_app/screens/home_screen.dart';
import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/services/location_service.dart';
import 'package:driver_app/services/auth_service.dart';
import 'package:driver_app/providers/providers.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:geolocator/geolocator.dart';

class MockRideService extends Mock implements RideService {}

class MockLocationService extends Mock implements LocationService {}

class MockAuthService extends Mock implements AuthService {}

class MockStorage extends Mock implements FlutterSecureStorage {}

class TestAuthNotifier extends AuthNotifier {
  TestAuthNotifier(AuthState initial) : super(MockAuthService(), MockStorage()) {
    state = initial;
  }
}

void main() {
  late MockRideService mockRideService;
  late MockLocationService mockLocationService;

  setUp(() {
    mockRideService = MockRideService();
    mockLocationService = MockLocationService();

    // Default mock behaviors
    when(() => mockRideService.getCurrentRide(any(), any()))
        .thenAnswer((_) async => null);
    when(() => mockRideService.toggleOnlineStatus(any(), any()))
        .thenAnswer((_) async => true);
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
        authProvider.overrideWith((ref) => TestAuthNotifier(
          const Authenticated('dummy-token', {
            'id': 'd1',
            'driverProfile': {
              'id': 'dp1',
              'isBiometricVerified': true,
              'isOnline': false,
            },
          }),
        )),
      ],
      child: legacy_provider.MultiProvider(
        providers: [
          legacy_provider.ChangeNotifierProvider(
            create: (_) => RideRequestProvider(),
          ),
        ],
        child: const MaterialApp(
          home: HomeScreen(),
        ),
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

    // Wait for the async network response in `_toggleOnline`
    // Note: Use pump() with duration instead of pumpAndSettle() because RadarAnimation repeats indefinitely
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.text('ONLINE'), findsOneWidget);
    expect(find.text('Go Offline'), findsOneWidget);

    // Cleanup: Go offline to stop the timer
    await tester.tap(find.text('Go Offline'));
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('OFFLINE'), findsOneWidget);
  });
}
