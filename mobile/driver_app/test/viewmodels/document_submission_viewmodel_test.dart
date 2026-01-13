import 'package:driver_app/services/document_service.dart';
import 'package:driver_app/viewmodels/document_submission_viewmodel.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mocktail/mocktail.dart';

class MockDocumentService extends Mock implements DocumentService {}

void main() {
  late MockDocumentService mockDocumentService;
  late DocumentSubmissionViewModel viewModel;

  setUpAll(() {
    registerFallbackValue(XFile(''));
  });

  setUp(() {
    // Create a fresh mock for each test
    mockDocumentService = MockDocumentService();
  });

  group('DocumentSubmissionViewModel', () {
    test(
      'Initial state is loading, then fetches documents successfully',
      () async {
        // Arrange: Mock the service to return a successful response
        final mockResponse = [
          {
            'type': "Driver's License",
            'status': 'Approved',
            'rejectionReason': null,
          },
          {
            'type': 'Vehicle Insurance',
            'status': 'Not Uploaded',
            'rejectionReason': null,
          },
        ];
        when(
          () => mockDocumentService.fetchDocumentStatus(),
        ).thenAnswer((_) async => mockResponse);

        // Act: Create the ViewModel, which triggers the initial fetch
        viewModel = DocumentSubmissionViewModel(
          documentService: mockDocumentService,
        );

        // Assert: Verify that the fetch was called
        verify(() => mockDocumentService.fetchDocumentStatus()).called(1);

        // We need to wait for the async operations in the constructor to complete.
        // A simple delay works for this test case.
        await Future.delayed(Duration.zero);

        // Assert: Check the final state
        expect(viewModel.isLoading, isFalse);
        expect(viewModel.error, isNull);
        expect(viewModel.documents.first.status, 'Approved');
        expect(viewModel.documents[1].status, 'Not Uploaded');
      },
    );

    test('Handles error during initial fetch', () async {
      // Arrange: Mock the service to throw an error
      final exception = Exception('Network Error');
      when(() => mockDocumentService.fetchDocumentStatus())
          .thenThrow(exception);

      // Act
      viewModel = DocumentSubmissionViewModel(
        documentService: mockDocumentService,
      );
      await Future.delayed(Duration.zero);

      // Assert
      expect(viewModel.isLoading, isFalse);
      expect(viewModel.error, exception.toString());
    });

    test('uploadDocument success case', () async {
      // Arrange
      when(
        () => mockDocumentService.fetchDocumentStatus(),
      ).thenAnswer((_) async => []);
      when(
        () => mockDocumentService.uploadDocument(any(), any()),
      ).thenAnswer((_) async {});
      final testImage = XFile('path/to/fake_image.jpg');

      viewModel = DocumentSubmissionViewModel(
        documentService: mockDocumentService,
      );
      await Future.delayed(Duration.zero); // Complete initial fetch

      // Act
      final result = await viewModel.uploadDocument(
        "Driver's License",
        testImage,
      );

      // Assert
      verify(
        () => mockDocumentService.uploadDocument("Driver's License", testImage),
      ).called(1);
      expect(viewModel.isLoading, isFalse);
      expect(viewModel.error, isNull);
      expect(result, "Driver's License uploaded successfully!");
      expect(viewModel.documents.first.status, 'Pending Review');
    });

    test('uploadDocument failure case', () async {
      // Arrange
      final exception = Exception('Upload Failed');
      when(
        () => mockDocumentService.fetchDocumentStatus(),
      ).thenAnswer((_) async => []);
      when(() => mockDocumentService.uploadDocument(any(), any()))
          .thenThrow(exception);
      final testImage = XFile('path/to/fake_image.jpg');

      viewModel = DocumentSubmissionViewModel(
        documentService: mockDocumentService,
      );
      await Future.delayed(Duration.zero);

      // Act
      final result = await viewModel.uploadDocument(
        "Driver's License",
        testImage,
      );

      // Assert
      expect(result, isNull);
      expect(viewModel.isLoading, isFalse);
      expect(viewModel.error, exception.toString());
      expect(
        viewModel.documents.first.status,
        'Not Uploaded',
      ); // Status should not change
    });

    test('submitForReview success case', () async {
      // Arrange
      when(
        () => mockDocumentService.fetchDocumentStatus(),
      ).thenAnswer((_) async => []);
      when(() => mockDocumentService.submitForReview())
          .thenAnswer((_) async {});

      viewModel = DocumentSubmissionViewModel(
        documentService: mockDocumentService,
      );
      await Future.delayed(Duration.zero);

      // Act
      final result = await viewModel.submitForReview();

      // Assert
      verify(() => mockDocumentService.submitForReview()).called(1);
      expect(viewModel.isLoading, isFalse);
      expect(viewModel.error, isNull);
      expect(result, contains('Documents submitted for review!'));
    });

    test('canSubmit computed property works correctly', () async {
      // Arrange
      when(
        () => mockDocumentService.fetchDocumentStatus(),
      ).thenAnswer((_) async => []);
      viewModel = DocumentSubmissionViewModel(
        documentService: mockDocumentService,
      );
      await Future.delayed(Duration.zero);

      // Assert: Initially false
      expect(viewModel.canSubmit, isFalse);

      // Act: Change one document status
      viewModel.documents.first.status = 'Pending Review';
      // ignore: invalid_use_of_visible_for_testing_member
      viewModel.notifyListeners(); // Manually notify for test

      // Assert: Still false
      expect(viewModel.canSubmit, isFalse);

      // Act: Change all document statuses
      for (var doc in viewModel.documents) {
        doc.status = 'Pending Review';
      }
      // ignore: invalid_use_of_visible_for_testing_member
      viewModel.notifyListeners();

      // Assert: Now true
      expect(viewModel.canSubmit, isTrue);

      // Act: Set loading to true
      // ignore: cascade_invocations
      for (var doc in viewModel.documents) {
        doc.status = 'Pending Review';
      }
      // Private method call simulation for testing state
      // In a real scenario, an async call would set this.
      viewModel.isLoading = true;
      // ignore: invalid_use_of_visible_for_testing_member
      viewModel.notifyListeners();

      // Assert: False when loading
      expect(viewModel.canSubmit, isFalse);
    });
  });
}
