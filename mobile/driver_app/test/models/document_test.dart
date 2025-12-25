import 'package:driver_app/models/document.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Document', () {
    test('constructor sets default values correctly', () {
      // Arrange
      const docType = "Driver's License";

      // Act
      final document = Document(type: docType);

      // Assert
      expect(document.type, docType);
      expect(document.status, 'Not Uploaded');
      expect(document.rejectionReason, isNull);
    });

    test('constructor sets all provided values correctly', () {
      // Arrange
      const docType = 'Vehicle Insurance';
      const status = 'Rejected';
      const reason = 'Image is blurry';

      // Act
      final document = Document(
        type: docType,
        status: status,
        rejectionReason: reason,
      );

      // Assert
      expect(document.type, docType);
      expect(document.status, status);
      expect(document.rejectionReason, reason);
    });
  });
}
