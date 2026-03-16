import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:passenger_app/main.dart' show CabiPassengerApp;
import 'package:passenger_app/providers/auth_provider.dart';
import 'package:passenger_app/services/auth_service.dart';
import 'package:passenger_app/screens/login_screen.dart';
import 'package:passenger_app/screens/registration_screen.dart';
import 'package:passenger_app/screens/home_screen.dart';
import 'package:google_fonts/google_fonts.dart';

// 1. Create a Mock AuthService that stores "registered" users in memory
class MockAuthService extends AuthService {
  final Map<String, String> _users = {}; // Phone -> Password
  final Map<String, Map<String, dynamic>> _userData = {}; // Phone -> User Object

  @override
  Future<AuthResult> register({
    required String firstName,
    required String lastName,
    String? email,
    required String phone,
    required String password,
    String? referralCode,
  }) async {
    debugPrint("[MOCK] Registering $phone...");
    await Future.delayed(const Duration(milliseconds: 500));
    _users[phone] = password;
    _userData[phone] = {
      'id': 'mock-id-${Random().nextInt(1000)}',
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'email': email ?? '$phone@cabi.africa',
    };
    return AuthResult(isSignedIn: true, user: _userData[phone]);
  }

  @override
  Future<AuthResult> signIn({required String identifier, required String password}) async {
    debugPrint("[MOCK] Signing in $identifier...");
    await Future.delayed(const Duration(milliseconds: 500));
    // Check if user exists in our mock "database"
    if (_users.containsKey(identifier) && _users[identifier] == password) {
      return AuthResult(
        isSignedIn: true,
        token: 'mock-jwt-token',
        user: _userData[identifier],
      );
    }
    return AuthResult(isSignedIn: false, error: 'Invalid credentials');
  }
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  GoogleFonts.config.allowRuntimeFetching = false;

  testWidgets('Full Auth Flow: Register then Login (with mock service)', (tester) async {
    final mockAuth = MockAuthService();

    debugPrint("[TEST] Starting application with MockAuthService overrides...");
    // We don't call app.main() because it sets up its own ProviderScope
    // Instead we build the app widget directly with overrides
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authServiceProvider.overrideWithValue(mockAuth),
        ],
        child: const CabiPassengerApp(),
      ),
    );

    // Initial settle for splash screen etc.
    for (int i = 0; i < 10; i++) {
        await tester.pump(const Duration(seconds: 1));
        if (find.byType(LoginScreen).evaluate().isNotEmpty) break;
    }

    // 1. On LoginScreen
    expect(find.byType(LoginScreen), findsOneWidget);
    debugPrint("[TEST] On LoginScreen.");

    // 2. Click Sign Up
    await tester.tap(find.text("Sign Up"));
    await tester.pumpAndSettle();
    expect(find.byType(RegistrationScreen), findsOneWidget);
    debugPrint("[TEST] On RegistrationScreen.");

    // 3. Register a new user
    final phone = "0712345678";
    final password = "Password123!";
    
    // Using indices for text fields in RegistrationScreen
    final textFields = find.byType(TextFormField);
    await tester.enterText(textFields.at(0), "Jane"); // First Name
    await tester.enterText(textFields.at(1), "Doe");  // Last Name
    // Skip email (index 2)
    await tester.enterText(textFields.at(3), phone);  // Phone
    await tester.enterText(textFields.at(4), password); // Password
    await tester.enterText(textFields.at(5), password); // Confirm Password
    await tester.pumpAndSettle();

    await tester.ensureVisible(find.text('COMPLETE REGISTRATION'));
    await tester.tap(find.text('COMPLETE REGISTRATION'));
    
    debugPrint("[TEST] Waiting for registration response...");
    // The screen handles navigation on success: SnackBar -> Delay(1s) -> Navigator.pop()
    // Pump enough for the mock delay + snackbar delay
    for (int i = 0; i < 5; i++) {
        await tester.pump(const Duration(seconds: 1));
        if (find.byType(LoginScreen).evaluate().isNotEmpty) break;
    }
    await tester.pumpAndSettle();

    // 4. Back on LoginScreen
    expect(find.byType(LoginScreen), findsOneWidget, reason: "Reg success should return to Login screen");
    debugPrint("[TEST] Back on LoginScreen. Logging in with $phone...");

    // Find login fields (Identifier, Password)
    final loginFields = find.byType(TextFormField);
    await tester.enterText(loginFields.at(0), phone);
    await tester.enterText(loginFields.at(1), password);
    await tester.pump();

    // Sign in button
    await tester.tap(find.text("Sign In"));
    
    debugPrint("[TEST] Waiting for login response...");
    // Long pump for transition and home screen init
    for (int i = 0; i < 10; i++) {
        await tester.pump(const Duration(seconds: 1));
        if (find.byType(HomeScreen).evaluate().isNotEmpty) break;
    }
    await tester.pumpAndSettle();

    // 5. Final Check: HomeScreen reached
    expect(find.byType(HomeScreen), findsOneWidget);
    debugPrint("[TEST] SUCCESS! Full Auth Flow Completed.");
    
    // Ensure one home screen feature is visible
    expect(find.text('Where to?'), findsWidgets);
  });
}
