import 'package:flutter/material.dart';
import 'dart:io'; // For File type, though we'll mock it.

enum DocumentStatus { notSubmitted, pending, approved, rejected }

class RequiredDocument {
  final String id;
  final String name;
  DocumentStatus status;

  RequiredDocument({
    required this.id,
    required this.name,
    this.status = DocumentStatus.notSubmitted,
  });
}

// Mock service to simulate document uploads and status updates
class DocumentService {
  Future<void> uploadDocument(String documentId, File file) async {
    // In a real app, this would use http/dio to upload the file to a backend service.
    await Future.delayed(const Duration(seconds: 2));
    print('Uploaded file for document: $documentId');
  }
}

class DocumentUploadScreen extends StatefulWidget {
  const DocumentUploadScreen({super.key});

  @override
  State<DocumentUploadScreen> createState() => _DocumentUploadScreenState();
}

class _DocumentUploadScreenState extends State<DocumentUploadScreen> {
  final _documentService = DocumentService();
  String? _uploadingDocumentId;

  // In a real app, this list would be fetched from a backend service.
  final List<RequiredDocument> _documents = [
    RequiredDocument(id: 'dl', name: "Driver's License"),
    RequiredDocument(id: 'logbook', name: 'Vehicle Logbook'),
    RequiredDocument(
      id: 'psv',
      name: 'PSV Insurance Certificate',
      status: DocumentStatus.approved,
    ),
    RequiredDocument(
      id: 'conduct',
      name: 'Certificate of Good Conduct',
      status: DocumentStatus.rejected,
    ),
  ];

  Future<void> _pickAndUpload(RequiredDocument doc) async {
    // In a real app, you would use image_picker or file_picker here.
    // For this mock, we'll simulate picking a file and then uploading.
    setState(() {
      _uploadingDocumentId = doc.id;
    });

    // Simulate picking a file.
    await Future.delayed(const Duration(milliseconds: 500));
    final mockFile = File('mock/path/to/image.jpg');

    await _documentService.uploadDocument(doc.id, mockFile);

    if (mounted) {
      setState(() {
        doc.status = DocumentStatus.pending;
        _uploadingDocumentId = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Required Documents')),
      body: ListView.builder(
        itemCount: _documents.length,
        itemBuilder: (context, index) {
          final doc = _documents[index];
          final isUploading = _uploadingDocumentId == doc.id;
          return ListTile(
            leading: _getStatusIcon(doc.status),
            title: Text(doc.name),
            subtitle: Text(_getStatusText(doc.status)),
            trailing: isUploading
                ? const CircularProgressIndicator()
                : const Icon(Icons.upload_file),
            onTap: isUploading || doc.status == DocumentStatus.approved
                ? null
                : () => _pickAndUpload(doc),
          );
        },
      ),
    );
  }

  Icon _getStatusIcon(DocumentStatus status) {
    switch (status) {
      case DocumentStatus.notSubmitted:
        return const Icon(Icons.description_outlined, color: Colors.grey);
      case DocumentStatus.pending:
        return const Icon(Icons.hourglass_top_rounded, color: Colors.orange);
      case DocumentStatus.approved:
        return const Icon(Icons.check_circle, color: Colors.green);
      case DocumentStatus.rejected:
        return const Icon(Icons.cancel, color: Colors.red);
    }
  }

  String _getStatusText(DocumentStatus status) {
    switch (status) {
      case DocumentStatus.notSubmitted:
        return 'Not Submitted';
      case DocumentStatus.pending:
        return 'Pending Review';
      case DocumentStatus.approved:
        return 'Approved';
      case DocumentStatus.rejected:
        return 'Rejected - Please re-upload';
    }
  }
}
