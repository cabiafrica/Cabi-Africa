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

  Future<void> _uploadDocument(
      BuildContext context, WidgetRef ref, String documentId) async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image == null) return;

    try {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Uploading document...')),
      );

      await ref
          .read(documentApiServiceProvider)
          .uploadDocument(documentId, image);

      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content:
                Text('Upload Successful! (Status would update in real app)'),
            backgroundColor: Colors.green),
      );
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Upload Failed: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    const primaryColor = Color(0xFFFFD700); // Prestige Gold
    const backgroundColor = Color(0xFF0A0A0A); // Deep Black
    final documents = ref.watch(documentsProvider);

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: const Text(
          'DOCUMENT SUBMISSION',
          style: TextStyle(
            color: primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 16,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: primaryColor),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'ELITE PARTNER VERIFICATION',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white70,
                fontSize: 12,
                letterSpacing: 3,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Please provide the necessary documentation to activate your professional status.',
              style: TextStyle(
                color: Colors.white38,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            Expanded(
              child: ListView.separated(
                itemCount: documents.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 16),
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
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // Placeholder for final submission logic
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                elevation: 10,
                shadowColor: primaryColor.withValues(alpha: 0.3),
              ),
              child: const Text(
                'SUBMIT FOR REVIEW',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
            ),
            const SizedBox(height: 20),
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
    const primaryColor = Color(0xFFFFD700);
    const surfaceColor = Color(0xFF141414);

    IconData icon;
    Color color;

    switch (status) {
      case 'Approved':
        icon = Icons.verified_rounded;
        color = Colors.greenAccent;
        break;
      case 'Pending Review':
        icon = Icons.hourglass_empty_rounded;
        color = primaryColor.withValues(alpha: 0.7);
        break;
      default: // 'Not Submitted' or 'Rejected'
        icon = Icons.add_circle_outline_rounded;
        color = primaryColor;
    }

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        leading: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4.0),
          child: Text(
            status.toUpperCase(),
            style: TextStyle(
              color: color.withValues(alpha: 0.6),
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
        ),
        trailing:
            const Icon(Icons.chevron_right_rounded, color: Colors.white24),
        onTap: onTap,
      ),
    );
  }
}
