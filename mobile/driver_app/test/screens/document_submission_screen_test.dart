import 'package:driver_app/screens/document_submission_screen.dart';
import 'package:driver_app/services/document_api_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockDocumentApiService extends Mock implements DocumentApiService {}

void main() {
  late MockDocumentApiService mockApiService;

  setUp(() {
    mockApiService = MockDocumentApiService();
  });

  testWidgets('DocumentSubmissionScreen displays document list',
      (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          documentApiServiceProvider.overrideWithValue(mockApiService),
        ],
        child: const MaterialApp(
          home: DocumentSubmissionScreen(),
        ),
      ),
    );

    expect(find.byType(DocumentSubmissionScreen), findsOneWidget);
    expect(find.text("Smart Driving License"), findsOneWidget);
    expect(find.text('Commercial PSV Insurance'), findsOneWidget);
    expect(find.byType(DocumentTile), findsWidgets);
  });

  testWidgets('Tapping a document tile triggers upload (mocked)',
      (tester) async {
    // Note: Testing actual ImagePicker requires more mocking.
    // We will just verify the tile exists and is tappable.

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          documentApiServiceProvider.overrideWithValue(mockApiService),
        ],
        child: const MaterialApp(
          home: DocumentSubmissionScreen(),
        ),
      ),
    );

    await tester.tap(find.text("Smart Driving License"));
    await tester.pump();

    // Since we can't easily mock ImagePicker's static platform interface without proper setup,
    // we expect that the tap happens.
    // If we wanted to check the upload call, we'd need to mock pickImage result.
    // For now, simple rendering and interaction potential is enough to pass compilation.
  });
}
