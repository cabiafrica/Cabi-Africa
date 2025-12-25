import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

// Adjust the import path to match your project structure
import 'package:driver_app/screens/weekly_statements_screen.dart';

// Mock the service class
class MockWeeklyStatementsService extends Mock
    implements WeeklyStatementsService {}

void main() {
  late MockWeeklyStatementsService mockStatementsService;

  // Sample data for successful fetch
  final mockStatements = [
    WeeklyStatement(
      weekOf: "2024-08-19",
      totalEarnings: 506.00,
      tripCount: 15,
      status: "Paid",
    ),
    WeeklyStatement(
      weekOf: "2024-08-12",
      totalEarnings: 480.50,
      tripCount: 14,
      status: "Paid",
    ),
  ];

  setUp(() {
    mockStatementsService = MockWeeklyStatementsService();
  });

  // Helper function to pump the widget with the injected mock service
  Future<void> pumpScreen(WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: WeeklyStatementsScreen(statementsService: mockStatementsService),
      ),
    );
  }

  testWidgets('shows loading indicator while fetching statements', (
    tester,
  ) async {
    // Arrange: Make the future never complete
    when(
      () => mockStatementsService.fetchWeeklyStatements(),
    ).thenAnswer((_) => Completer<List<WeeklyStatement>>().future);

    // Act
    await pumpScreen(tester);

    // Assert
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('displays an error message when fetching fails', (tester) async {
    // Arrange: Make the service throw an error
    when(
      () => mockStatementsService.fetchWeeklyStatements(),
    ).thenThrow(Exception('Failed to load statements'));

    // Act
    await pumpScreen(tester);
    await tester
        .pumpAndSettle(); // Wait for the future to resolve with an error

    // Assert
    expect(
      find.text('Error: Exception: Failed to load statements'),
      findsOneWidget,
    );
  });

  testWidgets('displays a message when no statements are found', (
    tester,
  ) async {
    // Arrange: Make the service return an empty list
    when(
      () => mockStatementsService.fetchWeeklyStatements(),
    ).thenAnswer((_) async => []);

    // Act
    await pumpScreen(tester);
    await tester.pumpAndSettle();

    // Assert
    expect(find.text('No weekly statements found.'), findsOneWidget);
  });

  group('on successful fetch', () {
    setUp(() {
      when(
        () => mockStatementsService.fetchWeeklyStatements(),
      ).thenAnswer((_) async => mockStatements);
    });

    testWidgets('displays a list of weekly statements', (tester) async {
      // Act
      await pumpScreen(tester);
      await tester.pumpAndSettle();

      // Assert
      expect(find.byType(ListTile), findsNWidgets(2));
      expect(find.text('Week of 2024-08-19'), findsOneWidget);
      expect(find.text('15 trips'), findsOneWidget);
      expect(find.text('\$506.00'), findsOneWidget);
      expect(find.text('Week of 2024-08-12'), findsOneWidget);
      expect(find.text('14 trips'), findsOneWidget);
      expect(find.text('\$480.50'), findsOneWidget);
    });

    testWidgets('tapping a statement shows a snackbar', (tester) async {
      // Act
      await pumpScreen(tester);
      await tester.pumpAndSettle();

      // Find and tap the first statement
      final firstStatement = find.text('Week of 2024-08-19');
      expect(firstStatement, findsOneWidget);
      await tester.tap(firstStatement);
      await tester.pump(); // Pump for snackbar animation

      // Assert: Check that the snackbar appears
      expect(
        find.text('Viewing details for Week of 2024-08-19'),
        findsOneWidget,
      );

      // Settle the snackbar to avoid it carrying over to the next test
      await tester.pumpAndSettle();
    });
  });
}
