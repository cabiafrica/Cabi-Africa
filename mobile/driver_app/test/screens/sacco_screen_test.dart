import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mocktail/mocktail.dart';
import 'package:driver_app/screens/sacco_screen.dart';
import 'package:driver_app/services/sacco_service.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/services/auth_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class MockSaccoService extends Mock implements SaccoService {}
class MockAuthService extends Mock implements AuthService {}
class MockSecureStorage extends Mock implements FlutterSecureStorage {}

class AuthNotifierMock extends AuthNotifier {
  AuthNotifierMock(AuthState state) : super(MockAuthService(), MockSecureStorage()) {
    this.state = state;
  }
}

void main() {
  late MockSaccoService mockSaccoService;

  setUp(() {
    mockSaccoService = MockSaccoService();
  });

  Widget createSaccoScreen() {
    return ProviderScope(
      overrides: [
        saccoServiceProvider.overrideWithValue(mockSaccoService),
        authProvider.overrideWith((ref) => AuthNotifierMock(
              const Authenticated("test-token", {"id": "driver-123"}),
            )),
      ],
      child: const MaterialApp(
        home: SaccoScreen(),
      ),
    );
  }

  group('SaccoScreen', () {
    testWidgets('shows loading indicator and then balance', (tester) async {
      // Arrange
      when(() => mockSaccoService.getSavingsBalance(any()))
          .thenAnswer((_) async => {'totalSavings': 12000.50});
      when(() => mockSaccoService.getTransactions(any()))
          .thenAnswer((_) async => []);

      // Act
      await tester.pumpWidget(createSaccoScreen());

      // Assert loading
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.pumpAndSettle();

      // Assert data
      expect(find.text('KES 12000.50'), findsOneWidget);
      expect(find.text('CABI Sacco'), findsOneWidget);
    });

    testWidgets('shows transactions list', (tester) async {
      // Arrange
      when(() => mockSaccoService.getSavingsBalance(any()))
          .thenAnswer((_) async => {'totalSavings': 5000.0});
      when(() => mockSaccoService.getTransactions(any()))
          .thenAnswer((_) async => [
                SaccoTransaction(
                  id: 'tx-1',
                  amount: 500.0,
                  type: 'DEPOSIT',
                  date: '2024-08-22T10:00:00Z',
                ),
              ]);

      // Act
      await tester.pumpWidget(createSaccoScreen());
      await tester.pumpAndSettle();

      // Assert
      expect(find.text('+KES 500'), findsOneWidget);
      expect(find.text('Sacco Deduction'), findsOneWidget);
    });

    testWidgets('tapping apply loan shows snackbar', (tester) async {
      // Arrange
      when(() => mockSaccoService.getSavingsBalance(any()))
          .thenAnswer((_) async => {'totalSavings': 100.0});
      when(() => mockSaccoService.getTransactions(any()))
          .thenAnswer((_) async => []);

      // Act
      await tester.pumpWidget(createSaccoScreen());
      await tester.pumpAndSettle();

      final applyButton = find.text('APPLY');
      await tester.tap(applyButton);
      await tester.pump();

      // Assert
      expect(find.text('Loan module launching soon!'), findsOneWidget);
    });
  });
}
