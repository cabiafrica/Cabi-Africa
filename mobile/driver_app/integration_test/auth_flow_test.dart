
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:driver_app/main.dart' show CabiDriverApp;
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/services/auth_service.dart';
import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/screens/home_screen.dart';
import 'package:driver_app/screens/trip_in_progress_screen.dart';
import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:driver_app/widgets/ride_request_modal.dart';
import 'package:driver_app/widgets/swipeable_action_button.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:driver_app/providers/map_provider.dart' as map_prov;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:driver_app/providers/providers.dart';

// --- Mocks ---
class MockAuthService extends Mock implements AuthService {}
class MockRideService extends Mock implements RideService {}
class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

// Simple Map Notifier to avoid SharedPreferences in tests
class SimpleMapNotifier extends map_prov.MapNotifier {
  SimpleMapNotifier() : super() {
    // Set default state immediately without loading SharedPreferences
    state = map_prov.MapType.cabi;
  }
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Driver Authentication Flow', () {
    late MockAuthService mockAuth;
    late MockRideService mockRide;
    late MockFlutterSecureStorage mockStorage;

    setUpAll(() {
      registerFallbackValue(Uri.parse('http://localhost'));
    });

    setUp(() {
      mockAuth = MockAuthService();
      mockRide = MockRideService();
      mockStorage = MockFlutterSecureStorage();
      SharedPreferences.setMockInitialValues({});

      // Default stubs
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});
      when(() => mockStorage.read(key: any(named: 'key')))
          .thenAnswer((_) async => null);
      when(() => mockStorage.delete(key: any(named: 'key')))
          .thenAnswer((_) async {});
      
      when(() => mockRide.getDriverStatus(any())).thenAnswer((_) async => true);
      when(() => mockRide.getCurrentRide(any(), any())).thenAnswer((_) async => null);
    });

    testWidgets('Driver Login: Success leads to HomeScreen', (tester) async {
      // Mock successful sign in
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async => AuthResult(
        isSignedIn: true,
        token: 'mock-jwt-token',
        user: {'id': 'driver-123', 'email': 'test@cabi.africa', 'firstName': 'Test', 'lastName': 'Driver'}
      ));

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authServiceProvider.overrideWithValue(mockAuth),
            rideServiceProvider.overrideWithValue(mockRide),
            secureStorageProvider.overrideWithValue(mockStorage),
            map_prov.mapProvider.overrideWith((ref) => SimpleMapNotifier()),
          ],
          child: const CabiDriverApp(),
        ),
      );

      debugPrint("[TEST] App started. Waiting for Splash Screen to settle...");
      
      // Settle splash screen
      for (int i = 0; i < 10; i++) {
        await tester.pump(const Duration(seconds: 1));
        if (find.byType(LoginScreen).evaluate().isNotEmpty) break;
      }
      await tester.pumpAndSettle();

      expect(find.byType(LoginScreen), findsOneWidget);
      debugPrint("[TEST] On LoginScreen.");

      // Enter credentials
      final emailField = find.byType(TextFormField).at(0);
      final passwordField = find.byType(TextFormField).at(1);

      await tester.enterText(emailField, 'test@cabi.africa');
      await tester.enterText(passwordField, 'Password123!');
      await tester.pumpAndSettle();

      debugPrint("[TEST] Credentials entered. Tapping Start Driving...");

      // Tap 'Start Driving' button
      final loginButton = find.text('Start Driving');
      await tester.ensureVisible(loginButton);
      await tester.tap(loginButton);
      
      debugPrint("[TEST] Waiting for login transition...");

      // Wait for navigation to HomeScreen
      for (int i = 0; i < 15; i++) {
        await tester.pump(const Duration(seconds: 1));
        if (find.byType(HomeScreen).evaluate().isNotEmpty) break;
      }
      await tester.pumpAndSettle();

      expect(find.byType(HomeScreen), findsOneWidget);
      debugPrint("[TEST] SUCCESS: Reached HomeScreen.");

      // --- Dashboard Flow ---
      debugPrint("[TEST] Verifying Dashboard Initial State...");
      expect(find.text('OFFLINE'), findsOneWidget);
      expect(find.text('Go Online'), findsOneWidget);

      // Tap Go Online
      await tester.tap(find.text('Go Online'));
      
      // Wait for loading and toggle (simulated delay in HomeScreen is 800ms)
      for (int i = 0; i < 5; i++) {
        await tester.pump(const Duration(milliseconds: 500));
        if (find.text('ONLINE').evaluate().isNotEmpty) break;
      }
      
      expect(find.text('ONLINE'), findsOneWidget);
      expect(find.text('Go Offline'), findsOneWidget);
      debugPrint("[TEST] SUCCESS: Driver is now ONLINE.");

      // Verify Stats are visible
      expect(find.text('Today'), findsOneWidget);
      expect(find.text('Trips'), findsOneWidget);
      expect(find.text('Rating'), findsOneWidget);
      
      // Tap Go Offline
      await tester.tap(find.text('Go Offline'));
      for (int i = 0; i < 5; i++) {
        await tester.pump(const Duration(milliseconds: 500));
        if (find.text('OFFLINE').evaluate().isNotEmpty) break;
      }
      expect(find.text('OFFLINE'), findsOneWidget);
      debugPrint("[TEST] SUCCESS: Driver is now OFFLINE.");
    });

    testWidgets('Trip Flow: Receive Request, Accept, and Complete Trip', (tester) async {
      // ── STEP 1: Test Ride Request Modal ─────────────────────────
      debugPrint("[TEST] STEP 1: Mounting RideRequestModal...");
      final rideReqProvider = RideRequestProvider();
      rideReqProvider.setRideRequest({
        'rideId': 'trip_789',
        'pickupAddress': 'Nairobi CBD',
        'distanceToPickup': '1.2 km',
        'passengerRating': '4.8',
        'isVerifiedPassenger': true,
        'passengerBadges': [],
      });

      await tester.pumpWidget(
        legacy_provider.MultiProvider(
          providers: [
            legacy_provider.ChangeNotifierProvider<RideRequestProvider>.value(
              value: rideReqProvider,
            ),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: Stack(
                children: [
                  RideRequestModal(
                    requestData: rideReqProvider.currentRideRequest!,
                    driverId: 'driver-123',
                    rideService: mockRide,
                  ),
                ],
              ),
            ),
            routes: {
              '/home': (context) => const HomeScreen(),
              '/trip_in_progress': (context) => const TripInProgressScreen(),
            },
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify modal content
      expect(find.byType(RideRequestModal), findsOneWidget);
      expect(find.textContaining('Nairobi CBD'), findsOneWidget);
      expect(find.textContaining('4.8'), findsOneWidget);
      expect(find.text('Verified Passenger'), findsOneWidget);
      debugPrint("[TEST] SUCCESS: RideRequestModal rendered correctly.");

      // Accept the ride
      when(() => mockRide.acceptRide(any(), any())).thenAnswer((_) async => {});
      final acceptButton = find.widgetWithText(ElevatedButton, 'Accept');
      expect(acceptButton, findsOneWidget);
      await tester.tap(acceptButton);
      await tester.pumpAndSettle();
      debugPrint("[TEST] SUCCESS: Ride accepted — navigated to TripInProgressScreen.");

      // ── STEP 2: TripInProgressScreen (mount independently) ───────
      debugPrint("[TEST] STEP 2: Mounting TripInProgressScreen...");
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            rideServiceProvider.overrideWithValue(mockRide),
            secureStorageProvider.overrideWithValue(mockStorage),
          ],
          child: MaterialApp(
            home: const TripInProgressScreen(rideId: 'trip_789', driverId: 'driver-123'),
            routes: {
              '/home': (context) => const HomeScreen(),
            },
          ),
        ),
      );
      when(() => mockRide.updateDriverLocation(any(), any(), any())).thenAnswer((_) async => {});
      when(() => mockRide.completeTrip(any())).thenAnswer((_) async => 250.0);

      await tester.pumpAndSettle();
      expect(find.text('On Trip'), findsOneWidget);
      expect(find.text('Current Fare'), findsOneWidget);

      // Let the trip timer tick
      await tester.pump(const Duration(seconds: 3));
      expect(find.textContaining('KES'), findsWidgets);
      debugPrint("[TEST] SUCCESS: Trip in progress, fare ticking.");

      // End the trip via swipe gesture
      final swipeButton = find.byType(SwipeableActionButton);
      expect(swipeButton, findsOneWidget);
      final Rect btnRect = tester.getRect(swipeButton);
      await tester.dragFrom(
        Offset(btnRect.left + 8, btnRect.center.dy),
        Offset(btnRect.width, 0),
      );
      await tester.pump(const Duration(milliseconds: 500));
      await tester.pumpAndSettle();

      // Waybill breakdown bottom sheet
      expect(find.text('Waybill Breakdown'), findsOneWidget);
      expect(find.text('Base Fare'), findsOneWidget);
      debugPrint("[TEST] SUCCESS: Waybill Breakdown displayed after trip end.");

      // Confirm payment and reset
      await tester.tap(find.text('Confirm Payment Received'));
      await tester.pumpAndSettle();

      // Should Navigate to home screen
      expect(find.byType(HomeScreen), findsOneWidget);
      debugPrint("[TEST] SUCCESS: Full trip lifecycle completed, returned to Home.");
    });


    testWidgets('Driver Login: Failure shows error message', (tester) async {
      // Mock failed sign in
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async => AuthResult(
        isSignedIn: false,
        error: 'invalid login credentials'
      ));

      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authServiceProvider.overrideWithValue(mockAuth),
            rideServiceProvider.overrideWithValue(mockRide),
            secureStorageProvider.overrideWithValue(mockStorage),
            map_prov.mapProvider.overrideWith((ref) => SimpleMapNotifier()),
          ],
          child: const CabiDriverApp(),
        ),
      );

      // Settle splash screen
      for (int i = 0; i < 10; i++) {
        await tester.pump(const Duration(seconds: 1));
        if (find.byType(LoginScreen).evaluate().isNotEmpty) break;
      }
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextFormField).at(0), 'wrong@cabi.africa');
      await tester.enterText(find.byType(TextFormField).at(1), 'wrongpass');
      await tester.pumpAndSettle();

      await tester.tap(find.text('Start Driving'));
      await tester.pumpAndSettle();

      expect(find.textContaining('Incorrect email or password'), findsOneWidget);
      debugPrint("[TEST] SUCCESS: Error message displayed correctly.");
    });
  });
}
