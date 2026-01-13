import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:provider/provider.dart';
import 'package:passenger_app/screens/otp_verification_screen.dart';
import 'package:passenger_app/services/auth_service.dart';
import 'package:passenger_app/providers/auth_provider.dart';

class MockAuthService extends Mock implements AuthService {}

class MockAuthProvider extends Mock implements AuthProvider {}

void main() {
  late MockAuthService mockAuthService;
  late MockAuthProvider mockAuthProvider;

  setUp(() {
    mockAuthService = MockAuthService();
    mockAuthProvider = MockAuthProvider();
  });

  Widget createWidgetUnderTest() {
    return ChangeNotifierProvider<AuthProvider>.value(
      value: mockAuthProvider,
      child: MaterialApp(
        home: OtpVerificationScreen(
          phone: '0712345678',
          authService: mockAuthService,
        ),
      ),
    );
  }

  testWidgets('validates OTP field', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.byType(ElevatedButton));
    await tester.pumpAndSettle();

    expect(find.text('Enter a valid 6-digit OTP'), findsOneWidget);
  });

  testWidgets('calls login on successful OTP verification', (tester) async {
    final mockUser = {'id': '1', 'phone': '0712345678'};
    when(() => mockAuthService.verifyOtp(
              phone: '0712345678',
              otp: '123456',
            ))
        .thenAnswer((_) async =>
            AuthResult(isSignedIn: true, token: 'mock_token', user: mockUser));

    await tester.pumpWidget(createWidgetUnderTest());

    await tester.enterText(find.byType(TextFormField), '123456');
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump(); // Start loading

    verify(() => mockAuthProvider.login('mock_token', mockUser)).called(1);
  });

  testWidgets('shows error on invalid OTP', (tester) async {
    when(() => mockAuthService.verifyOtp(
              phone: '0712345678',
              otp: '000000',
            ))
        .thenAnswer(
            (_) async => AuthResult(isSignedIn: false, error: 'Invalid OTP'));

    await tester.pumpWidget(createWidgetUnderTest());

    await tester.enterText(find.byType(TextFormField), '000000');
    await tester.tap(find.byType(ElevatedButton));
    await tester.pumpAndSettle();

    expect(find.text('Invalid OTP'), findsOneWidget);
  });
}
