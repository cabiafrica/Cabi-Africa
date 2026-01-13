import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

// This is a new file, adjust the import path to match your project structure
import 'package:driver_app/screens/document_history_screen.dart';

// Mock the service class
class MockDocumentHistoryService extends Mock
    implements DocumentHistoryService {}

void main() {
  late MockDocumentHistoryService mockHistoryService;

  // Sample data for successful fetch
  final List<DocumentSubmission> mockHistory = [
    DocumentSubmission(
      id: 'sub-2',
      status: 'Pending Review',
      submittedAt: '2024-08-20T11:00:00Z',
    ),
    DocumentSubmission(
      id: 'sub-1',
      status: 'Rejected',
      submittedAt: '2024-08-19T10:00:00Z',
      rejectionReason: 'Photo was blurry.',
    ),
  ];

  setUp(() {
    mockHistoryService = MockDocumentHistoryService();
  });

  // Helper function to pump the widget with the injected mock service
  Future<void> pumpScreen(
    WidgetTester tester, {
    required String docType,
  }) async {
    await tester.pumpWidget(
      MaterialApp(
        home: DocumentHistoryScreen(
          docType: docType,
          historyService: mockHistoryService,
        ),
      ),
    );
  }

  testWidgets('shows loading indicator while fetching history', (tester) async {
    // Arrange: Make the future never complete
    when(
      () => mockHistoryService.fetchDocumentHistory(
        any(),
        filter: HistoryFilterStatus.all,
      ),
    ).thenAnswer((_) => Completer<List<DocumentSubmission>>().future);

    // Act
    await pumpScreen(tester, docType: "Driver's License");

    // Assert
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('displays an error message when fetching fails', (tester) async {
    // Arrange: Make the service throw an error
    when(
      () => mockHistoryService.fetchDocumentHistory(
        any(),
        filter: HistoryFilterStatus.all,
      ),
    ).thenThrow(Exception('Failed to load history'));

    // Act
    await pumpScreen(tester, docType: "Driver's License");
    await tester
        .pumpAndSettle(); // Wait for the future to resolve with an error

    // Assert
    expect(
      find.text('Error: Exception: Failed to load history'),
      findsOneWidget,
    );
  });

  testWidgets('displays a message when history is empty', (tester) async {
    // Arrange: Make the service return an empty list
    when(
      () => mockHistoryService.fetchDocumentHistory(
        any(),
        filter: HistoryFilterStatus.all,
      ),
    ).thenAnswer((_) async => []);

    // Act
    await pumpScreen(tester, docType: "Driver's License");
    await tester.pumpAndSettle();

    // Assert
    expect(find.text('No submission history found.'), findsOneWidget);
  });

  testWidgets('displays a list of submission history on success', (
    tester,
  ) async {
    // Arrange: Make the service return mock data
    when(
      () => mockHistoryService.fetchDocumentHistory(
        any(),
        filter: HistoryFilterStatus.all,
      ),
    ).thenAnswer((_) async => mockHistory);

    // Act
    await pumpScreen(tester, docType: "Driver's License");
    await tester.pumpAndSettle();

    // Assert
    expect(find.byType(DocumentHistoryCard), findsNWidgets(2));

    // Check the first item in the list (most recent)
    expect(find.text('Submission #2'), findsOneWidget);
    // Note: Date formatting depends on the local timezone of the test runner.
    // A more robust test would mock the timezone or use a date formatting library.
    // For this example, we'll check for a reasonable part of the formatted string.
    expect(find.textContaining('20/8/2024'), findsOneWidget);
    expect(
      find.byWidgetPredicate(
        (widget) => widget is Chip && (widget.label as Text).data == 'Pending',
      ),
      findsOneWidget,
    );

    // Check the second item in the list
    expect(find.text('Submission #1'), findsOneWidget);
    expect(find.textContaining('19/8/2024'), findsOneWidget);
    expect(
      find.byWidgetPredicate(
        (widget) => widget is Chip && (widget.label as Text).data == 'Rejected',
      ),
      findsOneWidget,
    );
    expect(find.text('Rejection Reason:'), findsOneWidget);
    expect(find.text('Photo was blurry.'), findsOneWidget);
  });

  testWidgets('tapping filter button re-fetches and displays filtered data', (
    tester,
  ) async {
    // Arrange: Setup mock service for two calls
    // First call for 'All'
    when(
      () => mockHistoryService.fetchDocumentHistory(
        any(),
        filter: HistoryFilterStatus.all,
      ),
    ).thenAnswer((_) async => mockHistory);

    // Second call for 'Rejected'
    when(
      () => mockHistoryService.fetchDocumentHistory(
        any(),
        filter: HistoryFilterStatus.rejected,
      ),
    ).thenAnswer((_) async => [mockHistory[1]]); // Only the rejected item

    // Act: Initial render
    await pumpScreen(tester, docType: "Driver's License");
    await tester.pumpAndSettle();

    // Assert: Both cards are initially visible
    expect(find.byType(DocumentHistoryCard), findsNWidgets(2));
    expect(find.text('Submission #2'), findsOneWidget); // Pending
    expect(find.text('Submission #1'), findsOneWidget); // Rejected

    // Act: Tap the 'Rejected' filter button
    final rejectedFilterButton = find.text('Rejected');
    expect(rejectedFilterButton, findsOneWidget);
    await tester.tap(rejectedFilterButton);
    await tester.pumpAndSettle(); // Wait for re-fetch and re-render

    // Assert: Only the rejected card is now visible
    expect(find.byType(DocumentHistoryCard), findsOneWidget);
    expect(find.text('Submission #1'), findsOneWidget); // Rejected
    expect(find.text('Submission #2'), findsNothing); // Pending is gone

    // Verify the service was called with the correct filter
    verify(
      () => mockHistoryService.fetchDocumentHistory(
        any(),
        filter: HistoryFilterStatus.rejected,
      ),
    ).called(1);
  });
}
