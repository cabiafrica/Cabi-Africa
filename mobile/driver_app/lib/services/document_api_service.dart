import '../config/app_config.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

// In a real app, the Dio instance would be configured and provided globally.
final dioProvider = Provider(
  (ref) {
    final baseUrl = AppConfig.authApiUrl;
    return Dio(BaseOptions(baseUrl: baseUrl));
  },
);

final documentApiServiceProvider = Provider<DocumentApiService>((ref) {
  return DocumentApiService(ref.watch(dioProvider));
});

class DocumentApiService {
  final Dio _dio;

  DocumentApiService(this._dio);

  /// Uploads a document file to the backend.
  Future<void> uploadDocument(String documentType, XFile file) async {
    // Map frontend ID to Backend Enum
    String backendType = 'LICENSE_FRONT';
    if (documentType == 'license') {
      backendType = 'LICENSE_FRONT';
    } else if (documentType == 'insurance') {
      backendType = 'VEHICLE_INSURANCE';
    } else if (documentType == 'psv') {
      backendType = 'POLICE_CLEARANCE';
    }

    try {
      // SIMULATION: Since we don't have S3 configured, we generate a placeholder URL.
      // In a real app, we would upload `file` to S3, get the URL, then post to backend.
      // OR post formData to backend and backend handles storage.
      // Here we post JSON metadata to our new endpoint.
      final fakeUrl = 'https://placehold.co/600x800?text=$backendType+Image';

      await _dio.post('/documents/upload',
          data: {'type': backendType, 'url': fakeUrl});
      debugPrint('Document uploaded: $backendType');
    } catch (e) {
      debugPrint('Error uploading document: $e');
      rethrow;
    }
  }
}
