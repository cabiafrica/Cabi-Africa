import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:passenger_app/screens/otp_verification_screen.dart';
import 'package:passenger_app/services/auth_service.dart';
import 'package:passenger_app/providers/auth_provider.dart';

class MockAuthService extends Mock implements AuthService {}

class MockAuthProvider extends Mock implements AuthProvider {}

class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

void main() {
  late MockAuthService mockAuthService;
  late MockAuthProvider mockAuthProvider;
  late MockFlutterSecureStorage mockSecureStorage;

  setUp(() {
    mockAuthService = MockAuthService();
    mockAuthProvider = MockAuthProvider();
    mockSecureStorage = MockFlutterSecureStorage();
    when(() => mockSecureStorage.read(key: any(named: 'key')))
        .thenAnswer((_) async => null);
    when(() => mockSecureStorage.write(
          key: any(named: 'key'),
          value: any(named: 'value'),
        )).thenAnswer((_) async {});
  });

  Widget createWidgetUnderTest() {
    return ProviderScope(
      overrides: [
        secureStorageProvider.overrideWithValue(mockSecureStorage),
      ],
      child: legacy_provider.ChangeNotifierProvider<AuthProvider>.value(
        value: mockAuthProvider,
        child: MaterialApp(
          home: OtpVerificationScreen(
            phone: '0712345678',
            authService: mockAuthService,
          ),
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
    when(() => mockAuthProvider.login(any(), any())).thenAnswer((_) async {});
    when(() => mockAuthService.verifyOtp(
              phone: '0712345678',
              otp: '123456',
            ))
        .thenAnswer((_) async =>
            AuthResult(isSignedIn: true, token: 'mock_token', user: mockUser));

    await tester.pumpWidget(createWidgetUnderTest());

    await tester.enterText(find.byType(TextFormField), '123456');
    await tester.tap(find.byType(ElevatedButton));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 200));

    verify(() => mockAuthProvider.login('mock_token', mockUser)).called(1);
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump(const Duration(seconds: 5));
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
