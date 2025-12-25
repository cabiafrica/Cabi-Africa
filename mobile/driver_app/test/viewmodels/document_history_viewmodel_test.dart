import 'package:driver_app/viewmodels/document_history_viewmodel.dart';
import 'package:driver_app/services/document_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockDocumentService extends Mock implements DocumentService {}

void main() {
  late MockDocumentService mockDocumentService;
  late DocumentHistoryViewModel viewModel;

  setUp(() {
    mockDocumentService = MockDocumentService();
  });

  group('DocumentHistoryViewModel', () {
    const targetDocumentType = "Driver's License";

    final allHistoryResponse = [
      {
        'id': 'sub-1',
        'docType': "Driver's License",
        'submittedAt': '2024-08-19T10:00:00Z',
        'status': 'Rejected',
        'rejectionReason': 'Photo was blurry.',
      },
      {
        'id': 'sub-2',
        'docType': "Driver's License",
        'submittedAt': '2024-08-20T11:00:00Z',
        'status': 'Pending Review',
        'rejectionReason': null,
      },
      {
        'id': 'sub-3',
        'docType': 'Vehicle Insurance',
        'submittedAt': '2024-08-20T11:05:00Z',
        'status': 'Pending Review',
        'rejectionReason': null,
      },
    ];

    test(
      'Initial state is loading, then successfully fetches and filters history',
      () async {
        // Arrange
        when(
          () => mockDocumentService.fetchDocumentHistory(),
        ).thenAnswer((_) async => allHistoryResponse);

        // Act: ViewModel constructor triggers the fetch
        viewModel = DocumentHistoryViewModel(
          documentType: targetDocumentType,
          documentService: mockDocumentService,
        );

        // Assert: Verify fetch was called immediately
        verify(() => mockDocumentService.fetchDocumentHistory()).called(1);

        // Wait for async constructor logic to complete
        await Future.delayed(Duration.zero);

        // Assert: Check the final state
        expect(viewModel.isLoading, isFalse);
        expect(viewModel.error, isNull);
        expect(viewModel.history.length, 2); // Correctly filtered
        expect(
          viewModel.history.every((h) => h.docType == targetDocumentType),
          isTrue,
        );
      },
    );

    test('Handles error during history fetch', () async {
      // Arrange
      final exception = Exception('Failed to fetch');
      when(() => mockDocumentService.fetchDocumentHistory())
          .thenThrow(exception);

      // Act
      viewModel = DocumentHistoryViewModel(
        documentType: targetDocumentType,
        documentService: mockDocumentService,
      );
      await Future.delayed(Duration.zero);

      // Assert
      expect(viewModel.isLoading, isFalse);
      expect(viewModel.error, exception.toString());
      expect(viewModel.history, isEmpty);
    });

    test(
      'Handles case where no history exists for the specified document type',
      () async {
        // Arrange
        when(
          () => mockDocumentService.fetchDocumentHistory(),
        ).thenAnswer((_) async => allHistoryResponse);

        // Act
        viewModel = DocumentHistoryViewModel(
          documentType: 'NonExistent Document',
          documentService: mockDocumentService,
        );
        await Future.delayed(Duration.zero);

        // Assert
        expect(viewModel.isLoading, isFalse);
        expect(viewModel.error, isNull);
        expect(viewModel.history, isEmpty);
      },
    );
  });
}
