import 'package:driver_app/services/document_service.dart';
import 'package:flutter/material.dart';

/// A data class representing a single historical document submission.
class DocumentSubmission {
  final String id;
  final String docType;
  final DateTime submittedAt;
  final String status;
  final String? rejectionReason;

  DocumentSubmission({
    required this.id,
    required this.docType,
    required this.submittedAt,
    required this.status,
    this.rejectionReason,
  });

  factory DocumentSubmission.fromJson(Map<String, dynamic> json) {
    return DocumentSubmission(
      id: json['id'],
      docType: json['docType'],
      submittedAt: DateTime.parse(json['submittedAt']),
      status: json['status'],
      rejectionReason: json['rejectionReason'],
    );
  }
}

class DocumentHistoryViewModel extends ChangeNotifier {
  final DocumentService _documentService;
  final String documentType;

  bool _isLoading = false;
  String? _error;
  List<DocumentSubmission> _history = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<DocumentSubmission> get history => _history;

  DocumentHistoryViewModel({
    required this.documentType,
    DocumentService? documentService,
  }) : _documentService = documentService ?? DocumentService() {
    fetchHistory();
  }

  Future<void> fetchHistory() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final allHistoryJson = await _documentService.fetchDocumentHistory();
      final allHistory = allHistoryJson
          .map((json) => DocumentSubmission.fromJson(json))
          .toList();
      _history = allHistory
          .where((item) => item.docType == documentType)
          .toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
