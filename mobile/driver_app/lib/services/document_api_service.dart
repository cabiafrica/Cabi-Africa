import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

// In a real app, the Dio instance would be configured and provided globally.
final dioProvider = Provider(
  (ref) => Dio(BaseOptions(baseUrl: 'http://localhost:3000/api')),
);

final documentApiServiceProvider = Provider<DocumentApiService>((ref) {
  return DocumentApiService(ref.watch(dioProvider));
});

class DocumentApiService {
  final Dio _dio;

  DocumentApiService(this._dio);

  /// Uploads a document file to the backend.
  Future<void> uploadDocument(String documentType, XFile file) async {
    final fileName = file.path.split('/').last;
    final formData = FormData.fromMap({
      'documentType': documentType,
      'file': await MultipartFile.fromFile(file.path, filename: fileName),
    });

    try {
      await _dio.post('/users/me/documents', data: formData);
    } catch (e) {
      // In a real app, handle errors more gracefully
      print('Error uploading document: $e');
      rethrow;
    }
  }
}
