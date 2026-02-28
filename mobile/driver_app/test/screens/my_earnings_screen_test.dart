import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

// Adjust the import path to match your project structure
import 'package:driver_app/screens/my_earnings_screen.dart';
import '../mocks/image_mocks.dart';

// Mock the service class
class MockEarningsService extends Mock implements EarningsService {}

void main() {
  late MockEarningsService mockEarningsService;

  // Sample data for successful fetch
  final mockEarningsData = EarningsData(
    summary: {
      'today': EarningsSummary(
        tripEarnings: 75.50,
        commissionEarnings: 10.00,
        total: 85.50,
      ),
      'thisWeek': EarningsSummary(
        tripEarnings: 450.25,
        commissionEarnings: 55.75,
        total: 506.00,
      ),
      'thisMonth': EarningsSummary(
        tripEarnings: 1890.80,
        commissionEarnings: 210.50,
        total: 2101.30,
      ),
    },
    recentTransactions: [
      Transaction(
        id: "txn-1",
        date: "2024-08-22T14:30:00Z",
        type: "Trip Fare",
        amount: 22.50,
        description: "Trip to Downtown",
      ),
      Transaction(
        id: "txn-3",
        date: "2024-08-21T18:00:00Z",
        type: "Commission",
        amount: 5.00,
        description: "Referral bonus from Jane D.",
      ),
    ],
  );

  setUp(() {
    mockEarningsService = MockEarningsService();
  });

  // Helper function to pump the widget with the injected mock service
  Future<void> pumpScreen(WidgetTester tester) async {
    await tester.binding.setSurfaceSize(const Size(1200, 3000));
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: MyEarningsScreen(earningsService: mockEarningsService),
        ),
      ),
    );
  }

  testWidgets('shows loading indicator while fetching earnings', (
    tester,
  ) async {
    // Arrange: Make the future never complete
    when(
      () => mockEarningsService.fetchMyEarnings(),
    ).thenAnswer((_) => Completer<EarningsData>().future);

    // Act
    await provideMockedNetworkImages(() async {
      await pumpScreen(tester);
      // Assert
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });

  testWidgets('displays an error message when fetching fails', (tester) async {
    // Arrange: Make the service throw an error
    when(
      () => mockEarningsService.fetchMyEarnings(),
    ).thenAnswer((_) async => throw Exception('Failed to load earnings'));

    // Act
    await provideMockedNetworkImages(() async {
      await pumpScreen(tester);
      await tester.pumpAndSettle(); // Wait for the future to resolve

      // Assert
      expect(
        find.textContaining('Failed to load earnings'),
        findsOneWidget,
      );
    });
  });

  group('on successful fetch', () {
    setUp(() {
      when(
        () => mockEarningsService.fetchMyEarnings(),
      ).thenAnswer((_) async => mockEarningsData);
    });

    testWidgets('displays earnings summary and recent transactions', (
      tester,
    ) async {
      // Act
      await provideMockedNetworkImages(() async {
        await pumpScreen(tester);
        await tester.pumpAndSettle();

        // Assert: Default view is 'thisWeek'
        expect(find.textContaining('506.00'), findsWidgets);
        expect(find.textContaining('450.25'), findsWidgets);
        expect(find.textContaining('55.75'), findsWidgets);

        // Assert: Transactions are displayed
        expect(find.text('Recent Transactions'), findsOneWidget);
        expect(find.text('Trip to Downtown'), findsOneWidget);
        expect(find.text('Referral bonus from Jane D.'), findsOneWidget);
      });
    });

    testWidgets(
      'tapping "Request Payout" shows confirmation dialog and calls service',
      (tester) async {
        // Arrange
        when(() => mockEarningsService.requestPayout(any()))
            .thenAnswer((_) async => {});

        // Act
        await provideMockedNetworkImages(() async {
          await pumpScreen(tester);
          await tester.pumpAndSettle();

          // Find and tap the payout button
          final payoutButton = find.widgetWithText(
            ElevatedButton,
            'Request Payout',
          );
          expect(payoutButton, findsOneWidget);
          await tester.tap(payoutButton);
          await tester.pumpAndSettle(); // Wait for dialog to appear

          // Assert: Dialog is shown
          expect(find.byType(AlertDialog), findsOneWidget);

          // Act: Tap confirm
          final confirmButton = find.widgetWithText(TextButton, 'Confirm');
          expect(confirmButton, findsOneWidget);
          await tester.tap(confirmButton);

          // Wait for first snackbar and dialog dismissal
          await tester.pump();
          await tester.pump(const Duration(milliseconds: 500));
          await tester.pumpAndSettle();

          // Wait for service call and second snackbar
          await tester.pump(const Duration(seconds: 1));
          await tester.pumpAndSettle();

          expect(find.byType(SnackBar), findsWidgets);

          // Assert: Service method was called
          final summary = mockEarningsData.summary['thisWeek']!;
          verify(() => mockEarningsService.requestPayout(summary.total))
              .called(1);
        });
      },
    );
  });
}
