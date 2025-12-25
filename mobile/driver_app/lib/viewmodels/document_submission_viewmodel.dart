import 'package:driver_app/services/document_service.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:driver_app/models/document.dart'; // Import the new Document class

class DocumentSubmissionViewModel extends ChangeNotifier {
  late final DocumentService _documentService;
  bool _isLoading = false;
  String? _error;

  final List<Document> _documents = [
    Document(type: "Driver's License"),
    Document(type: "Vehicle Insurance"),
    Document(type: "Vehicle Registration"),
  ];

  // Public getters
  List<Document> get documents => _documents;
  bool get isLoading => _isLoading;
  @visibleForTesting
  set isLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  String? get error => _error;
  bool get canSubmit =>
      !_isLoading && _documents.every((doc) => doc.status == "Pending Review");

  DocumentSubmissionViewModel({DocumentService? documentService}) {
    _documentService = documentService ?? DocumentService();
    fetchDocumentStatus();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  Future<void> fetchDocumentStatus() async {
    _setLoading(true);
    try {
      final statusData = await _documentService.fetchDocumentStatus();
      if (statusData.isNotEmpty) {
        for (var docData in statusData) {
          final doc = _documents.firstWhere((d) => d.type == docData['type']);
          doc.status = docData['status'] as String;
          doc.rejectionReason = docData['rejectionReason'] as String?;
        }
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _setLoading(false);
    }
  }

  Future<String?> uploadDocument(String docName, XFile image) async {
    _setLoading(true);
    String? successMessage;
    try {
      await _documentService.uploadDocument(docName, image);
      final doc = _documents.firstWhere((d) => d.type == docName);
      doc.status = "Pending Review";
      doc.rejectionReason = null;
      successMessage = '$docName uploaded successfully!';
    } catch (e) {
      _error = e.toString();
    } finally {
      _setLoading(false);
    }
    return successMessage;
  }

  Future<String?> submitForReview() async {
    _setLoading(true);
    String? successMessage;
    try {
      await _documentService.submitForReview();
      successMessage =
          'Documents submitted for review! Your application status is now PENDING_APPROVAL.';
    } catch (e) {
      _error = e.toString();
    } finally {
      _setLoading(false);
    }
    return successMessage;
  }

  void clearError() {
    _error = null;
  }
}
