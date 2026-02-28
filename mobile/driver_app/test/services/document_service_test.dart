import 'dart:convert';
import 'dart:io';

import 'package:driver_app/services/document_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:image_picker/image_picker.dart';

void main() {
  late DocumentService documentService;
  late MockClient mockClient;

  group('DocumentService', () {
    group('fetchDocumentStatus', () {
      test('returns a list of documents on a successful call (200)', () async {
        // Arrange
        final mockResponse = [
          {'type': "Driver's License", 'status': 'Approved'},
        ];
        mockClient = MockClient((request) async {
          expect(request.url.path, '/api/documents/me');
          return http.Response(json.encode(mockResponse), 200);
        });
        documentService = DocumentService(client: mockClient);

        // Act
        final result = await documentService.fetchDocumentStatus();

        // Assert
        expect(result, isA<List<Map<String, dynamic>>>());
        expect(result.first['status'], 'Approved');
      });

      test('throws an exception on a failed call', () async {
        // Arrange
        mockClient = MockClient((_) async => http.Response('Not Found', 404));
        documentService = DocumentService(client: mockClient);

        // Act & Assert
        expect(
          () => documentService.fetchDocumentStatus(),
          throwsA(isA<Exception>()),
        );
      });
    });

    group('uploadDocument', () {
      test('completes successfully on a 201 response', () async {
        // Arrange
        mockClient = MockClient((request) async {
          expect(request.url.path, '/api/users/me/documents');
          return http.Response('', 201);
        });
        documentService = DocumentService(client: mockClient);
        // Create a dummy file for the test
        final file = File('test_image.jpg');
        await file.writeAsBytes([0, 1, 2, 3]);

        final testImage = XFile(file.path);

        // Act & Assert
        // We expect this to complete without throwing an exception.
        try {
          await expectLater(
            documentService.uploadDocument("Driver's License", testImage),
            completes,
          );
        } finally {
          if (await file.exists()) await file.delete();
        }
      });

      test('throws an exception on a non-201 response', () async {
        // Arrange
        mockClient = MockClient(
          (_) async => http.Response('Server Error', 500),
        );
        documentService = DocumentService(client: mockClient);
        final testImage = XFile('test/path/to/fake_image.jpg');

        // Act & Assert
        expect(
          () => documentService.uploadDocument("Driver's License", testImage),
          throwsA(isA<Exception>()),
        );
      });
    });

    group('submitForReview', () {
      test('completes successfully on a 201 response', () async {
        // Arrange
        mockClient = MockClient((request) async {
          expect(request.url.path, '/api/users/me/documents/submit');
          return http.Response('', 201);
        });
        documentService = DocumentService(client: mockClient);

        // Act & Assert
        await expectLater(documentService.submitForReview(), completes);
      });

      test('throws an exception on a non-201 response', () async {
        // Arrange
        mockClient = MockClient((_) async => http.Response('Bad Request', 400));
        documentService = DocumentService(client: mockClient);

        // Act & Assert
        expect(
          () => documentService.submitForReview(),
          throwsA(isA<Exception>()),
        );
      });
    });
  });
}
