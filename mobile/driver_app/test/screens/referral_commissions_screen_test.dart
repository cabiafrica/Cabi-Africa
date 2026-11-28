import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:driver_app/screens/referral_commissions_screen.dart';
import 'package:driver_app/services/referral_service.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/services/auth_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class MockReferralService extends Mock implements ReferralService {}
class MockAuthService extends Mock implements AuthService {}
class MockSecureStorage extends Mock implements FlutterSecureStorage {}

class AuthNotifierMock extends AuthNotifier {
  AuthNotifierMock(AuthState state) : super(MockAuthService(), MockSecureStorage()) {
    this.state = state;
  }
}

void main() {
  late MockReferralService mockReferralService;

  setUp(() {
    mockReferralService = MockReferralService();
  });

  Widget createScreen() {
    return ProviderScope(
      overrides: [
        referralServiceProvider.overrideWithValue(mockReferralService),
        authProvider.overrideWith((ref) => AuthNotifierMock(
              const Authenticated("test-token", {"userId": "driver-123"}),
            )),
      ],
      child: const MaterialApp(
        home: ReferralCommissionsScreen(),
      ),
    );
  }

  group('ReferralCommissionsScreen', () {
    testWidgets('shows stats and referral code', (tester) async {
      // Arrange
      when(() => mockReferralService.getReferralStats(any()))
          .thenAnswer((_) async => {
                'totalEarned': 1500.75,
                'history': [],
              });
      when(() => mockReferralService.getReferralCode(any()))
          .thenAnswer((_) async => 'ABC-123');

      // Act
      await tester.pumpWidget(createScreen());

      // Assert loading
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.pumpAndSettle();

      // Assert data
      expect(find.text('KES 1500.75'), findsOneWidget);
      expect(find.text('My Commissions'), findsOneWidget);
    });

    testWidgets('shows history list', (tester) async {
      // Arrange
      when(() => mockReferralService.getReferralStats(any()))
          .thenAnswer((_) async => {
                'totalEarned': 50.0,
                'history': [
                  {
                    'id': 'h1',
                    'amount': 50.0,
                    'date': '2024-08-22T10:00:00Z',
                    'description': 'Test Commission',
                    'sourceDriverId': 'D-99'
                  }
                ],
              });
      when(() => mockReferralService.getReferralCode(any()))
          .thenAnswer((_) async => 'ABC-123');

      // Act
      await tester.binding.setSurfaceSize(const Size(1080, 2400));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(createScreen());
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('Test Commission'), findsOneWidget);
      expect(find.text('+KES 50'), findsOneWidget);
    });

    testWidgets('tapping share copies to clipboard', (tester) async {
      // Arrange
      when(() => mockReferralService.getReferralStats(any()))
          .thenAnswer((_) async => {
                'totalEarned': 0.0,
                'history': [],
              });
      when(() => mockReferralService.getReferralCode(any()))
          .thenAnswer((_) async => 'ABC-123');

      // Act
      await tester.pumpWidget(createScreen());
      await tester.pumpAndSettle();

      final shareButton = find.byIcon(Icons.share);
      await tester.tap(shareButton);
      await tester.pump();

      // Assert snackbar
      expect(find.text('Referral code copied to clipboard!'), findsOneWidget);
    });
  });
}
