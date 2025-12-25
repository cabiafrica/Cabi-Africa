import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:passenger_app/services/auth_service.dart';
import 'package:passenger_app/screens/login_screen.dart';
import 'package:passenger_app/main.dart'; // For PassengerMapView

class MockAuthService extends Mock implements AuthService {}

void main() {
  late MockAuthService mockAuthService;

  setUp(() {
    mockAuthService = MockAuthService();
  });

  Widget createWidgetUnderTest() {
    return ProviderScope(
      overrides: [authServiceProvider.overrideWithValue(mockAuthService)],
      child: const MaterialApp(
        home: LoginScreen(),
      ),
    );
  }

  testWidgets('shows error messages for empty fields', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.byType(ElevatedButton));
    await tester.pump(); // Let the state update

    expect(find.text('Please enter your phone number'), findsOneWidget);
    expect(find.text('Please enter your password'), findsOneWidget);
  });

  testWidgets('navigates to PassengerMapView on successful login',
      (tester) async {
    when(() => mockAuthService.signIn(phoneNumber: '123', password: 'password'))
        .thenAnswer((_) async => true);

    await tester.pumpWidget(createWidgetUnderTest());

    await tester.enterText(find.byType(TextFormField).first, '123');
    await tester.enterText(find.byType(TextFormField).last, 'password');
    await tester.tap(find.byType(ElevatedButton));
    await tester.pumpAndSettle();

    expect(find.byType(PassengerMapView), findsOneWidget);
  });

  testWidgets('shows error message on failed login', (tester) async {
    when(() => mockAuthService.signIn(phoneNumber: '123', password: 'wrong'))
        .thenAnswer((_) async => false);

    await tester.pumpWidget(createWidgetUnderTest());

    await tester.enterText(find.byType(TextFormField).first, '123');
    await tester.enterText(find.byType(TextFormField).last, 'wrong');
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump();

    expect(
      find.text('Login failed. Please check your credentials.'),
      findsOneWidget,
    );
  });
}
