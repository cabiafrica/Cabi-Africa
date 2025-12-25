import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/widgets/auth_wrapper.dart';
import 'package:driver_app/screens/login_screen.dart';
import 'package:driver_app/screens/home_screen.dart';

// Since HomeScreen and LoginScreen are complex, we create simple mock versions
// for this test to keep it focused on the AuthWrapper's logic.
class MockHomeScreen extends StatelessWidget {
  const MockHomeScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Text('Home Screen'));
}

class MockLoginScreen extends StatelessWidget {
  const MockLoginScreen({super.key});
  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Text('Login Screen'));
}

void main() {
  group('AuthWrapper', () {
    testWidgets(
      'shows loading indicator for AuthInitial and AuthLoading states',
      (WidgetTester tester) async {
        // Test for AuthInitial state
        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              // Override the authProvider to return a specific state
              authProvider.overrideWith(
                (ref) => MockAuthNotifier(const AuthInitial()),
              ),
            ],
            child: const MaterialApp(home: AuthWrapper()),
          ),
        );
        expect(find.byType(CircularProgressIndicator), findsOneWidget);

        // Test for AuthLoading state
        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              authProvider.overrideWith(
                (ref) => MockAuthNotifier(const AuthLoading()),
              ),
            ],
            child: const MaterialApp(home: AuthWrapper()),
          ),
        );
        expect(find.byType(CircularProgressIndicator), findsOneWidget);
      },
    );

    testWidgets('shows LoginScreen for Unauthenticated state', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith(
              (ref) => MockAuthNotifier(const Unauthenticated()),
            ),
          ],
          // We need to replace the real LoginScreen with our mock
          child: const MaterialApp(home: AuthWrapper()),
        ),
      );
      // In a real test, you might find a key or specific text on the login screen.
      // Here we assume LoginScreen() is what AuthWrapper renders.
      // For a clean test, we'd inject the screen widgets.
      expect(find.byType(LoginScreen), findsOneWidget);
    });

    testWidgets('shows HomeScreen for Authenticated state', (
      WidgetTester tester,
    ) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            authProvider.overrideWith(
              (ref) => MockAuthNotifier(const Authenticated('fake-token')),
            ),
          ],
          child: const MaterialApp(home: AuthWrapper()),
        ),
      );
      expect(find.byType(HomeScreen), findsOneWidget);
    });
  });
}

// A mock StateNotifier for testing purposes
class MockAuthNotifier extends StateNotifier<AuthState>
    implements AuthNotifier {
  MockAuthNotifier(super.initialState);

  @override
  Future<void> login(String phone, String otp) async {}

  @override
  Future<void> logout() async {}

  @override
  Future<void> tryAutoLogin() async {}
}
