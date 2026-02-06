import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

/// A service class responsible for all document-related API communication.
class DocumentService {
  String get _baseUrl {
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3333/api';
    }
    return 'http://localhost:3333/api';
  }

  final http.Client _client;

  DocumentService({http.Client? client}) : _client = client ?? http.Client();

  /// Fetches the current status of documents for the logged-in user.
  Future<List<Map<String, dynamic>>> fetchDocumentStatus() async {
    final response = await _client.get(Uri.parse('$_baseUrl/documents/me'));

    if (response.statusCode == 200) {
      final List<dynamic> responseData = jsonDecode(response.body);
      return responseData.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Failed to load document status: ${response.statusCode}');
    }
  }

  /// Uploads a single document file.
  Future<void> uploadDocument(String docName, XFile image) async {
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('$_baseUrl/users/me/documents'),
    );
    request.fields['documentType'] = docName;
    request.files.add(
      // In a real app with a non-mock client, you might need a helper for this.
      // For testing with http/testing, this is fine.
      await http.MultipartFile.fromPath('file', image.path),
    );

    var response = await request.send();

    if (response.statusCode != 201) {
      throw Exception(
        'Failed to upload document. Status code: ${response.statusCode}',
      );
    }
  }

  /// Submits all uploaded documents for final review.
  Future<void> submitForReview() async {
    final response = await _client.post(
      Uri.parse('$_baseUrl/users/me/documents/submit'),
    );

    if (response.statusCode != 201) {
      throw Exception(
        'Failed to submit for review. Please ensure all documents are uploaded.',
      );
    }
  }

  /// Fetches the submission history for the logged-in user.
  Future<List<Map<String, dynamic>>> fetchDocumentHistory() async {
    final response = await _client.get(
      Uri.parse('$_baseUrl/documents/me/history'),
    );

    if (response.statusCode == 200) {
      final List<dynamic> responseData = jsonDecode(response.body);
      return responseData.cast<Map<String, dynamic>>();
    } else {
      throw Exception(
        'Failed to load document history: ${response.statusCode}',
      );
    }
  }
}
