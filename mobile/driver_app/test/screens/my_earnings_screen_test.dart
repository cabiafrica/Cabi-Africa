import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

// Adjust the import path to match your project structure
import 'package:driver_app/screens/my_earnings_screen.dart';

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
    await tester.pumpWidget(
      MaterialApp(home: MyEarningsScreen(earningsService: mockEarningsService)),
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
    await pumpScreen(tester);

    // Assert
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('displays an error message when fetching fails', (tester) async {
    // Arrange: Make the service throw an error
    when(
      () => mockEarningsService.fetchMyEarnings(),
    ).thenThrow(Exception('Failed to load earnings'));

    // Act
    await pumpScreen(tester);
    await tester
        .pumpAndSettle(); // Wait for the future to resolve with an error

    // Assert
    expect(
      find.text('Error: Exception: Failed to load earnings'),
      findsOneWidget,
    );
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
      await pumpScreen(tester);
      await tester.pumpAndSettle();

      // Assert: Default view is 'thisWeek'
      expect(find.text('\$506.00'), findsOneWidget); // Week's total
      expect(find.text('\$450.25'), findsOneWidget); // Week's trip fares
      expect(find.text('\$55.75'), findsOneWidget); // Week's commissions

      // Assert: Transactions are displayed
      expect(find.text('Recent Transactions'), findsOneWidget);
      expect(find.text('Trip to Downtown'), findsOneWidget);
      expect(find.text('Referral bonus from Jane D.'), findsOneWidget);
      expect(find.text('+\$22.50'), findsOneWidget);
    });

    testWidgets('tapping period selector updates the summary card', (
      tester,
    ) async {
      // Act
      await pumpScreen(tester);
      await tester.pumpAndSettle();

      // Assert: Initial state is 'thisWeek'
      expect(find.text('\$506.00'), findsOneWidget);

      // Act: Tap 'Today'
      await tester.tap(find.text('Today'));
      await tester.pump(); // Rebuild the widget

      // Assert: Summary card updates to show today's earnings
      expect(find.text('\$85.50'), findsOneWidget);
      expect(find.text('\$75.50'), findsOneWidget);
      expect(find.text('\$10.00'), findsOneWidget);
      expect(find.text('\$506.00'), findsNothing);

      // Act: Tap 'Month'
      await tester.tap(find.text('Month'));
      await tester.pump();

      // Assert: Summary card updates to show this month's earnings
      expect(find.text('\$2101.30'), findsOneWidget);
      expect(find.text('\$1890.80'), findsOneWidget);
      expect(find.text('\$210.50'), findsOneWidget);
      expect(find.text('\$85.50'), findsNothing);
    });

    testWidgets('displays correct icons for transaction types', (tester) async {
      // Act
      await pumpScreen(tester);
      await tester.pumpAndSettle();

      // Assert: Find the ListTile for the trip fare
      final tripTile = find.widgetWithText(ListTile, 'Trip to Downtown');
      expect(
        find.descendant(of: tripTile, matching: find.byIcon(Icons.local_taxi)),
        findsOneWidget,
      );

      // Assert: Find the ListTile for the commission
      final commissionTile = find.widgetWithText(
        ListTile,
        'Referral bonus from Jane D.',
      );
      expect(
        find.descendant(of: commissionTile, matching: find.byIcon(Icons.group)),
        findsOneWidget,
      );
    });

    testWidgets(
      'tapping "Request Payout" shows confirmation dialog and calls service',
      (tester) async {
        // Arrange
        when(
          () => mockEarningsService.requestPayout(any()),
        ).thenAnswer((_) async {});

        // Act
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
        expect(find.text('Confirm Payout'), findsOneWidget);
        expect(
          find.textContaining('Request a payout of \$506.00'),
          findsOneWidget,
        );

        // Act: Tap the 'Confirm' button in the dialog
        final confirmButton = find.widgetWithText(TextButton, 'Confirm');
        await tester.tap(confirmButton);
        await tester.pump(); // Start animations for snackbar

        // Assert: Dialog is gone, snackbar is shown
        expect(find.byType(AlertDialog), findsNothing);
        expect(find.text('Submitting your payout request...'), findsOneWidget);

        // Let snackbars finish
        await tester.pumpAndSettle();

        // Assert: Service method was called
        verify(() => mockEarningsService.requestPayout(506.00)).called(1);

        // Assert: Success snackbar is shown
        expect(
          find.text('Payout request submitted successfully!'),
          findsOneWidget,
        );
      },
    );
  });
}
