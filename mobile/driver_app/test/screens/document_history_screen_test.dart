import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

// Adjust the import path to match your project structure
import 'package:driver_app/screens/document_history_screen.dart';
import '../mocks/image_mocks.dart';

// Mock the service class
class MockDocumentHistoryService extends Mock
    implements DocumentHistoryService {}

void main() {
  late MockDocumentHistoryService mockHistoryService;

  // Sample data for successful fetch
  final mockHistory = [
    DocumentSubmission(
      id: "sub-2",
      submittedAt: "2024-08-20T11:00:00Z",
      status: "Pending Review",
    ),
    DocumentSubmission(
      id: "sub-1",
      submittedAt: "2024-08-19T10:00:00Z",
      status: "Rejected",
      rejectionReason: "Photo was blurry.",
    ),
  ];

  setUpAll(() {
    registerFallbackValue(HistoryFilterStatus.all);
  });

  setUp(() {
    mockHistoryService = MockDocumentHistoryService();
  });

  // Helper function to pump the widget with the injected mock service
  Future<void> pumpScreen(WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: DocumentHistoryScreen(
          docType: "Driver's License",
          historyService: mockHistoryService,
        ),
      ),
    );
  }

  testWidgets('shows loading indicator while fetching document history', (
    tester,
  ) async {
    // Arrange: Make the future never complete
    when(
      () => mockHistoryService.fetchDocumentHistory(any(),
          filter: any(named: 'filter')),
    ).thenAnswer((_) => Completer<List<DocumentSubmission>>().future);

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
      () => mockHistoryService.fetchDocumentHistory(any(),
          filter: any(named: 'filter')),
    ).thenAnswer((_) async => throw Exception('Failed to load history'));

    // Act
    await provideMockedNetworkImages(() async {
      await pumpScreen(tester);
      await tester.pumpAndSettle(); // Wait for future to resolve

      // Assert
      expect(
        find.text('Error: Exception: Failed to load history'),
        findsOneWidget,
      );
    });
  });

  group('on successful fetch', () {
    setUp(() {
      when(
        () => mockHistoryService.fetchDocumentHistory(any(),
            filter: any(named: 'filter')),
      ).thenAnswer((_) async => mockHistory);
    });

    testWidgets('displays document history list correctly', (tester) async {
      // Act
      await provideMockedNetworkImages(() async {
        await pumpScreen(tester);
        await tester.pumpAndSettle();

        // Assert
        expect(find.text("Driver's License History"), findsOneWidget);
        expect(find.text('Submission #2'), findsOneWidget);

        // Look for the "Pending" status label on the card
        expect(
            find.descendant(
              of: find.byType(Card),
              matching: find.text('Pending'),
            ),
            findsOneWidget);

        // Date format is d/m/yyyy -> 20/8/2024
        expect(find.text('20/8/2024'), findsOneWidget);
        expect(find.text('Photo was blurry.'), findsOneWidget);
      });
    });

    testWidgets('tapping filter updates the data', (tester) async {
      await provideMockedNetworkImages(() async {
        await pumpScreen(tester);
        await tester.pumpAndSettle();

        // Act: Tap filter button
        await tester.tap(find.descendant(
          of: find.byType(SegmentedButton<HistoryFilterStatus>),
          matching: find.text('Pending'),
        ));
        await tester.pumpAndSettle();

        // Verify that fetchDocumentHistory was called again with filter
        verify(() => mockHistoryService.fetchDocumentHistory(any(),
            filter: HistoryFilterStatus.pending)).called(1);
      });
    });
  });
}
