import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:passenger_app/screens/registration_screen.dart';

import 'package:passenger_app/services/auth_service.dart';

class MockAuthService extends Mock implements AuthService {}

void main() {
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
  });

  Widget createWidgetUnderTest(WidgetTester tester) {
    tester.view.physicalSize = const Size(1080, 4000);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    return ProviderScope(
      child: MaterialApp(
        home: RegistrationScreen(authService: mockAuthService),
      ),
    );
  }

  testWidgets('validates empty fields', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest(tester));

    await tester.ensureVisible(find.byType(ElevatedButton));
    await tester.tap(find.byType(ElevatedButton));
    await tester.pumpAndSettle();

    expect(find.text('First Name is required'), findsOneWidget);
    expect(find.text('Last Name is required'), findsOneWidget);
    expect(find.text('Please enter your phone number'), findsOneWidget);
    expect(find.text('Password must be at least 8 characters long'),
        findsOneWidget);
  });

  testWidgets('validates invalid phone and password', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest(tester));

    await tester.enterText(find.byType(TextFormField).at(3), '123'); // Phone
    await tester.enterText(
        find.byType(TextFormField).at(4), 'password'); // Password
    await tester.enterText(
        find.byType(TextFormField).at(5), 'password'); // Confirm

    await tester.ensureVisible(find.byType(ElevatedButton));
    await tester.tap(find.byType(ElevatedButton));
    await tester.pumpAndSettle();

    expect(find.textContaining('Enter a valid Kenyan phone number'), findsOneWidget);
    expect(find.text('Must contain: Lowercase, Uppercase, Number & Symbol'),
        findsOneWidget);
  });

  testWidgets('shows success message on successful registration',
      (tester) async {
    when(() => mockAuthService.register(
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '0712345678',
              password: 'Password123!',
              referralCode: '',
            ))
        .thenAnswer(
            (_) async => AuthResult(isSignedIn: true, user: {'id': '1'}));

    await tester.pumpWidget(createWidgetUnderTest(tester));

    await tester.enterText(find.byType(TextFormField).at(0), 'John');
    await tester.enterText(find.byType(TextFormField).at(1), 'Doe');
    await tester.enterText(
        find.byType(TextFormField).at(2), 'john@example.com');
    await tester.enterText(find.byType(TextFormField).at(3), '0712345678');
    await tester.enterText(find.byType(TextFormField).at(4), 'Password123!');
    await tester.enterText(find.byType(TextFormField).at(5), 'Password123!');

    await tester.ensureVisible(find.byType(ElevatedButton));
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump(); // simulate click
    await tester.pump(const Duration(milliseconds: 100)); // Wait for snackbar

    expect(find.text('Registration successful! Welcome to Cabi Africa.'),
        findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump(const Duration(seconds: 5));
  });

  testWidgets('shows error message on failed registration', (tester) async {
    when(() => mockAuthService.register(
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '0712345678',
              password: 'Password123!',
              referralCode: '',
            ))
        .thenAnswer((_) async =>
            AuthResult(isSignedIn: false, error: 'Email already exists'));

    await tester.pumpWidget(createWidgetUnderTest(tester));

    await tester.enterText(find.byType(TextFormField).at(0), 'John');
    await tester.enterText(find.byType(TextFormField).at(1), 'Doe');
    await tester.enterText(
        find.byType(TextFormField).at(2), 'john@example.com');
    await tester.enterText(find.byType(TextFormField).at(3), '0712345678');
    await tester.enterText(find.byType(TextFormField).at(4), 'Password123!');
    await tester.enterText(find.byType(TextFormField).at(5), 'Password123!');

    await tester.ensureVisible(find.byType(ElevatedButton));
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump(); // simulate click
    await tester.pump(const Duration(milliseconds: 100)); // Wait for snackbar

    expect(
        find.text('Registration Failed: Email already exists'), findsOneWidget);
    await tester.pumpAndSettle(const Duration(seconds: 4)); // clear snackbar
  });
}
