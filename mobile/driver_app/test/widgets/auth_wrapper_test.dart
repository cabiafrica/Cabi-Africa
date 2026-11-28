import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:mocktail/mocktail.dart';
import 'package:geolocator_platform_interface/geolocator_platform_interface.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';

import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/widgets/auth_wrapper.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/screens/home_screen.dart';
import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/services/auth_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:driver_app/providers/providers.dart';
import '../mocks/image_mocks.dart';

// Mock for GeolocatorPlatform
class MockGeolocatorPlatform extends Mock
    with MockPlatformInterfaceMixin
    implements GeolocatorPlatform {
  @override
  Future<LocationPermission> checkPermission() =>
      Future.value(LocationPermission.always);

  @override
  Future<LocationPermission> requestPermission() =>
      Future.value(LocationPermission.always);

  @override
  Future<bool> isLocationServiceEnabled() => Future.value(true);

  @override
  Future<Position> getCurrentPosition({LocationSettings? locationSettings}) =>
      Future.value(Position(
          latitude: 0,
          longitude: 0,
          timestamp: DateTime.now(),
          accuracy: 0,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          headingAccuracy: 0,
          speed: 0,
          speedAccuracy: 0));

  @override
  Stream<Position> getPositionStream({LocationSettings? locationSettings}) =>
      Stream.fromIterable([]);
}

class MockRideService extends Mock implements RideService {}

class MockAuthService extends Mock implements AuthService {}

class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

class MockAuthNotifier extends AuthNotifier {
  MockAuthNotifier(AuthState initialState)
      : super(MockAuthService(), MockFlutterSecureStorage()) {
    state = initialState;
  }
}

void main() {
  late MockRideService mockRideService;

  setUpAll(() {
    registerFallbackValue(Uri.parse('http://localhost'));
  });

  setUp(() {
    mockRideService = MockRideService();
    when(() => mockRideService.getDriverStatus(any()))
        .thenAnswer((_) async => true);
    when(() => mockRideService.getCurrentRide(any(), any()))
        .thenAnswer((_) async => null);
    GeolocatorPlatform.instance = MockGeolocatorPlatform();
  });

  group('AuthWrapper', () {
    testWidgets('shows loading indicator for AuthInitial state',
        (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider
                .overrideWith((ref) => MockAuthNotifier(const AuthInitial())),
          ],
          child: const MaterialApp(home: AuthWrapper()),
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('shows LoginScreen for Unauthenticated state', (tester) async {
      await provideMockedNetworkImages(() async {
        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              authProvider.overrideWith(
                  (ref) => MockAuthNotifier(const Unauthenticated())),
            ],
            child: const MaterialApp(home: AuthWrapper()),
          ),
        );
        expect(find.byType(LoginScreen), findsOneWidget);
      });
    });

    testWidgets('shows HomeScreen for Authenticated state', (tester) async {
      await provideMockedNetworkImages(() async {
        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              authProvider.overrideWith((ref) => MockAuthNotifier(
                  const Authenticated('fake-token', {
                    'id': 'driver-123',
                    'role': 'DRIVER',
                    'driverProfile': {
                      'id': 'dp-123',
                      'isBiometricVerified': true,
                      'isOnline': false,
                    },
                  }))),
              rideServiceProvider.overrideWithValue(mockRideService),
            ],
            child: legacy_provider.ChangeNotifierProvider(
              create: (_) => RideRequestProvider(),
              child: MaterialApp(
                home: const AuthWrapper(),
                routes: {'/login': (_) => const LoginScreen()},
              ),
            ),
          ),
        );

        await tester.pump(const Duration(milliseconds: 100));
        expect(find.byType(HomeScreen), findsOneWidget);
        await tester.pumpWidget(const SizedBox.shrink());
        await tester.pump(const Duration(seconds: 1));
      });
    });
  });
}
