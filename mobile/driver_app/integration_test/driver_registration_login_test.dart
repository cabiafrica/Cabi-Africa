import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:driver_app/main.dart' show CabiDriverApp;
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/services/auth_service.dart';
import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/screens/home_screen.dart';
import 'package:driver_app/providers/map_provider.dart' as map_prov;
import 'package:driver_app/providers/providers.dart';

// ─── Mocks ───────────────────────────────────────────────────────────────────
class MockAuthService extends Mock implements AuthService {}
class MockRideService extends Mock implements RideService {}
class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

/// Avoids SharedPreferences calls during map initialisation
class SimpleMapNotifier extends map_prov.MapNotifier {
  SimpleMapNotifier() : super() {
    state = map_prov.MapType.cabi;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

Future<void> _dismissKeyboard(WidgetTester tester) async {
  FocusManager.instance.primaryFocus?.unfocus();
  await tester.pumpAndSettle();
}

/// Boot the full app with dependency injection overrides.
Widget _buildApp({
  required MockAuthService mockAuth,
  required MockRideService mockRide,
  required MockFlutterSecureStorage mockStorage,
}) {
  return ProviderScope(
    overrides: [
      authServiceProvider.overrideWithValue(mockAuth),
      rideServiceProvider.overrideWithValue(mockRide),
      secureStorageProvider.overrideWithValue(mockStorage),
      map_prov.mapProvider.overrideWith((ref) => SimpleMapNotifier()),
    ],
    child: const CabiDriverApp(),
  );
}

/// Pump the app and wait past the splash screen until [LoginScreen] appears.
Future<void> _waitForLoginScreen(WidgetTester tester) async {
  for (int i = 0; i < 12; i++) {
    await tester.pump(const Duration(seconds: 1));
    if (find.byType(LoginScreen).evaluate().isNotEmpty) break;
  }
  await tester.pumpAndSettle();
}

// ─── Test Suite ───────────────────────────────────────────────────────────────
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Driver Registration & Login Flow', () {
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

      // Storage stubs
      when(() => mockStorage.write(key: any(named: 'key'), value: any(named: 'value')))
          .thenAnswer((_) async {});
      when(() => mockStorage.read(key: any(named: 'key')))
          .thenAnswer((_) async => null);
      when(() => mockStorage.delete(key: any(named: 'key')))
          .thenAnswer((_) async {});

      // Ride stubs
      when(() => mockRide.getDriverStatus(any())).thenAnswer((_) async => true);
      when(() => mockRide.getCurrentRide(any(), any())).thenAnswer((_) async => null);
    });

    // ── 1. Login Screen UI ───────────────────────────────────────────────────
    testWidgets('1. LoginScreen renders with correct UI elements', (tester) async {
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async =>
          AuthResult(isSignedIn: false, error: 'not called'));

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));
      await _waitForLoginScreen(tester);

      // Brand
      expect(find.text('CABI DRIVE'), findsOneWidget);
      expect(find.text('Drive With Pride!'), findsOneWidget);
      expect(find.text('Earn more on your own schedule'), findsOneWidget);

      // Tabs
      expect(find.text('Log In'), findsOneWidget);
      expect(find.text('Sign Up'), findsOneWidget);

      // Login tab active by default — fields visible
      expect(find.byType(TextFormField), findsNWidgets(2));
      expect(find.text('Start Driving'), findsOneWidget);

      // Legal footer
      expect(find.textContaining('Terms of Service'), findsOneWidget);

      debugPrint('[TEST 1] ✅ LoginScreen UI verified.');
    });

    // ── 2. Tab switching ─────────────────────────────────────────────────────
    testWidgets('2. Tapping Sign Up tab hides login fields and shows registration message', (tester) async {
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async =>
          AuthResult(isSignedIn: false, error: 'not called'));

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));
      await _waitForLoginScreen(tester);

      // Login tab is default
      expect(find.text('Start Driving'), findsOneWidget);

      // Tap Sign Up tab
      await tester.tap(find.text('Sign Up'));
      await tester.pumpAndSettle();

      // Login fields hidden
      expect(find.text('Start Driving'), findsNothing);

      // Registration portal message & button visible
      expect(find.text('Registration is handled via portal'), findsOneWidget);
      expect(find.text('Sign Up'), findsWidgets); // tab label + button

      // Switch back to Log In
      await tester.tap(find.text('Log In'));
      await tester.pumpAndSettle();
      expect(find.text('Start Driving'), findsOneWidget);

      debugPrint('[TEST 2] ✅ Tab switching works correctly.');
    });

    // ── 3. Form validation — empty fields ────────────────────────────────────
    testWidgets('3. Submitting empty form shows validation errors', (tester) async {
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async =>
          AuthResult(isSignedIn: false, error: 'not called'));

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));
      await _waitForLoginScreen(tester);

      // Tap Start Driving with empty fields
      await _dismissKeyboard(tester);
      final startBtn = find.text('Start Driving');
      await tester.ensureVisible(startBtn);
      await tester.tap(startBtn);
      await tester.pumpAndSettle();

      // Validation messages appear
      expect(find.text('Invalid email'), findsOneWidget);
      expect(find.text('Required'), findsOneWidget);

      // Auth was never called
      verifyNever(() => mockAuth.signIn(any(), any()));

      debugPrint('[TEST 3] ✅ Empty form validation works.');
    });

    // ── 4. Form validation — invalid email ───────────────────────────────────
    testWidgets('4. Submitting invalid email shows validation error', (tester) async {
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async =>
          AuthResult(isSignedIn: false, error: 'not called'));

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));
      await _waitForLoginScreen(tester);

      await tester.enterText(find.byType(TextFormField).at(0), 'notanemail');
      await tester.enterText(find.byType(TextFormField).at(1), 'password123');
      await _dismissKeyboard(tester);
      final startBtn = find.text('Start Driving');
      await tester.ensureVisible(startBtn);
      await tester.tap(startBtn);
      await tester.pumpAndSettle();

      expect(find.text('Invalid email'), findsOneWidget);
      verifyNever(() => mockAuth.signIn(any(), any()));

      debugPrint('[TEST 4] ✅ Invalid email validation works.');
    });

    // ── 5. Successful login → HomeScreen ─────────────────────────────────────
    testWidgets('5. Successful login navigates to HomeScreen', (tester) async {
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async => AuthResult(
            isSignedIn: true,
            token: 'mock-jwt-token',
            user: {
              'id': 'driver-001',
              'email': 'driver@cabi.africa',
              'firstName': 'Ibrahim',
              'lastName': 'Kenyatta',
            },
          ));

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));
      await _waitForLoginScreen(tester);

      await tester.enterText(find.byType(TextFormField).at(0), 'driver@cabi.africa');
      await tester.enterText(find.byType(TextFormField).at(1), 'Secure@123');
      await tester.pumpAndSettle();

      await _dismissKeyboard(tester);
      final startBtn = find.text('Start Driving');
      await tester.ensureVisible(startBtn);
      await tester.tap(startBtn);

      // Wait for navigation
      for (int i = 0; i < 15; i++) {
        await tester.pump(const Duration(seconds: 1));
        if (find.byType(HomeScreen).evaluate().isNotEmpty) break;
      }
      await tester.pumpAndSettle();

      expect(find.byType(HomeScreen), findsOneWidget);

      // Token was persisted (rememberMe = true by default)
      verify(() => mockStorage.write(key: 'jwt_token', value: 'mock-jwt-token'))
          .called(1);

      debugPrint('[TEST 5] ✅ Successful login → HomeScreen. Token persisted.');
    });

    // ── 6. Login with wrong credentials ──────────────────────────────────────
    testWidgets('6. Wrong credentials shows humanised error message', (tester) async {
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async =>
          AuthResult(isSignedIn: false, error: 'invalid login credentials'));

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));
      await _waitForLoginScreen(tester);

      await tester.enterText(find.byType(TextFormField).at(0), 'wrong@cabi.africa');
      await tester.enterText(find.byType(TextFormField).at(1), 'wrongpass');
      await tester.pumpAndSettle();

      await _dismissKeyboard(tester);
      final startBtn = find.text('Start Driving');
      await tester.ensureVisible(startBtn);
      await tester.tap(startBtn);
      await tester.pumpAndSettle();

      expect(
        find.textContaining('Incorrect email or password'),
        findsOneWidget,
      );

      // Still on login screen
      expect(find.byType(LoginScreen), findsOneWidget);

      debugPrint('[TEST 6] ✅ Wrong credentials: error shown, stays on LoginScreen.');
    });

    // ── 7. Remember Me toggle — token NOT stored when unchecked ──────────────
    testWidgets('7. Remember Me unchecked: token is deleted not stored', (tester) async {
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async => AuthResult(
            isSignedIn: true,
            token: 'temp-token',
            user: {'id': 'driver-002', 'email': 'temp@cabi.africa'},
          ));

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));
      await _waitForLoginScreen(tester);

      // Uncheck Remember Me
      await _dismissKeyboard(tester);
      final checkbox = find.byType(Checkbox);
      expect(checkbox, findsOneWidget);
      await tester.ensureVisible(checkbox);
      await tester.tap(checkbox);
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextFormField).at(0), 'temp@cabi.africa');
      await tester.enterText(find.byType(TextFormField).at(1), 'Pass@456');
      await _dismissKeyboard(tester);
      final startBtn = find.text('Start Driving');
      await tester.ensureVisible(startBtn);
      await tester.tap(startBtn);

      for (int i = 0; i < 15; i++) {
        await tester.pump(const Duration(seconds: 1));
        if (find.byType(HomeScreen).evaluate().isNotEmpty) break;
      }
      await tester.pumpAndSettle();

      expect(find.byType(HomeScreen), findsOneWidget);

      // Token should NOT be written; instead deleted (session-only)
      verifyNever(() => mockStorage.write(key: 'jwt_token', value: any(named: 'value')));
      verify(() => mockStorage.delete(key: 'jwt_token')).called(1);

      debugPrint('[TEST 7] ✅ Remember Me unchecked: token deleted (session-only login).');
    });

    // ── 8. Auto-login from stored token ──────────────────────────────────────
    testWidgets('8. Valid stored token auto-logs in, skips LoginScreen', (tester) async {
      // Simulate a token already stored from a previous session
      when(() => mockStorage.read(key: 'jwt_token'))
          .thenAnswer((_) async => 'stored-valid-token');

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));

      // Wait for splash + auto-login
      for (int i = 0; i < 15; i++) {
        await tester.pump(const Duration(seconds: 1));
        if (find.byType(HomeScreen).evaluate().isNotEmpty) break;
      }
      await tester.pumpAndSettle();

      // Should land on HomeScreen directly, bypassing LoginScreen
      expect(find.byType(HomeScreen), findsOneWidget);
      expect(find.byType(LoginScreen), findsNothing);

      debugPrint('[TEST 8] ✅ Stored token: auto-login bypassed LoginScreen.');
    });

    // ── 9. Password visibility toggle ────────────────────────────────────────
    testWidgets('9. Password visibility toggle works', (tester) async {
      when(() => mockAuth.signIn(any(), any())).thenAnswer((_) async =>
          AuthResult(isSignedIn: false, error: 'not called'));

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));
      await _waitForLoginScreen(tester);

      // Password field is obscured by default — check via the underlying EditableText
      bool isObscured() {
        final editableText = tester.widget<EditableText>(
          find.descendant(
            of: find.byType(TextFormField).at(1),
            matching: find.byType(EditableText),
          ),
        );
        return editableText.obscureText;
      }

      expect(isObscured(), isTrue);

      // Tap the visibility icon to reveal
      final visibilityIcon = find.byIcon(Icons.visibility_outlined);
      expect(visibilityIcon, findsOneWidget);
      await tester.tap(visibilityIcon);
      await tester.pumpAndSettle();

      expect(isObscured(), isFalse);

      // Tap again to hide
      await tester.tap(find.byIcon(Icons.visibility_off_outlined));
      await tester.pumpAndSettle();
      expect(isObscured(), isTrue);

      debugPrint('[TEST 9] ✅ Password visibility toggle works.');
    });

    // ── 10. Network error shows human-friendly message ───────────────────────
    testWidgets('10. Network error shows friendly connection message', (tester) async {
      when(() => mockAuth.signIn(any(), any()))
          .thenThrow(Exception('SocketException: Failed host lookup'));

      await tester.pumpWidget(_buildApp(
          mockAuth: mockAuth, mockRide: mockRide, mockStorage: mockStorage));
      await _waitForLoginScreen(tester);

      await tester.enterText(find.byType(TextFormField).at(0), 'driver@cabi.africa');
      await tester.enterText(find.byType(TextFormField).at(1), 'Pass@123');
      final startBtn = find.text('Start Driving');
      await tester.ensureVisible(startBtn);
      await tester.tap(startBtn);
      await tester.pumpAndSettle();

      expect(
        find.textContaining('Unable to connect to the server'),
        findsOneWidget,
      );

      debugPrint('[TEST 10] ✅ Network error shows connection message.');
    });
  });
}
