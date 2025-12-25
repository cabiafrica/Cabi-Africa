import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../services/document_api_service.dart';

// Mock data model for a document. In a real app, this would be a DTO.
class OnboardingDocument {
  final String id;
  final String title;
  final String status; // e.g., 'Not Submitted', 'Pending Review', 'Approved'

  OnboardingDocument({
    required this.id,
    required this.title,
    required this.status,
  });
}

// Mock provider for the list of required documents.
// In a real app, this would fetch data from a backend service.
final documentsProvider = Provider<List<OnboardingDocument>>((ref) {
  return [
    OnboardingDocument(
      id: 'license',
      title: "Driver's License",
      status: 'Not Submitted',
    ),
    OnboardingDocument(
      id: 'insurance',
      title: 'Vehicle Insurance',
      status: 'Not Submitted',
    ),
    OnboardingDocument(
      id: 'psv',
      title: 'PSV License',
      status: 'Not Submitted',
    ),
  ];
});

class DocumentSubmissionScreen extends ConsumerWidget {
  const DocumentSubmissionScreen({super.key});

  Future<void> _uploadDocument(BuildContext context, WidgetRef ref, String documentId) async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    
    if (image == null) return;

    try {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Uploading document...')),
      );

      await ref.read(documentApiServiceProvider).uploadDocument(documentId, image);
      
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Upload Successful! (Status would update in real app)'), 
          backgroundColor: Colors.green
        ),
      );
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Upload Failed: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final documents = ref.watch(documentsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Upload Documents')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Please upload the following documents to continue.',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: ListView.builder(
                itemCount: documents.length,
                itemBuilder: (context, index) {
                  final doc = documents[index];
                  return DocumentTile(
                    title: doc.title,
                    status: doc.status,
                    onTap: () => _uploadDocument(context, ref, doc.id),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // Placeholder for final submission logic
              },
              child: const Text('Submit for Review'),
            ),
          ],
        ),
      ),
    );
  }
}

class DocumentTile extends StatelessWidget {
  final String title;
  final String status;
  final VoidCallback onTap;

  const DocumentTile({
    super.key,
    required this.title,
    required this.status,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    IconData icon;
    Color color;

    switch (status) {
      case 'Approved':
        icon = Icons.check_circle;
        color = Colors.green;
        break;
      case 'Pending Review':
        icon = Icons.hourglass_top;
        color = Colors.orange;
        break;
      default: // 'Not Submitted' or 'Rejected'
        icon = Icons.upload_file;
        color = Theme.of(context).colorScheme.primary;
    }

    return Card(
      child: ListTile(
        leading: Icon(icon, color: color),
        title: Text(title),
        subtitle: Text(status),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: onTap,
      ),
    );
  }
}
