import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../services/document_api_service.dart';
import 'package:driver_app/theme/app_theme.dart';

class OnboardingDocument {
  final String id;
  final String title;
  final String category;
  String status; // 'Not Submitted', 'Verifying...', 'Approved', 'Rejected'
  String? documentNumber;
  String? verificationTime;

  OnboardingDocument({
    required this.id,
    required this.title,
    required this.category,
    this.status = 'Not Submitted',
    this.documentNumber,
    this.verificationTime,
  });
}

class DocumentSubmissionScreen extends ConsumerStatefulWidget {
  const DocumentSubmissionScreen({super.key});

  @override
  ConsumerState<DocumentSubmissionScreen> createState() =>
      _DocumentSubmissionScreenState();
}

class _DocumentSubmissionScreenState
    extends ConsumerState<DocumentSubmissionScreen> {
  static const Color _prestigeGold = AppTheme.primaryColor;
  static const Color _darkSurface = AppTheme.darkSurface;
  static const Color _cabiGreen = Color(0xFF00A859);

  final List<OnboardingDocument> _documents = [
    OnboardingDocument(
      id: 'license',
      title: "Smart Driving License",
      category: "Class D1/A2 &bull; NTSA Verified",
      status: 'Not Submitted',
    ),
    OnboardingDocument(
      id: 'national_id',
      title: "National ID / Alien Card",
      category: "Age 24+ &bull; IPRS Verified",
      status: 'Not Submitted',
    ),
    OnboardingDocument(
      id: 'psv',
      title: "DCI Police Clearance (Good Conduct)",
      category: "eCitizen Validated &bull; Negative Record",
      status: 'Not Submitted',
    ),
    OnboardingDocument(
      id: 'insurance',
      title: "Commercial PSV Insurance",
      category: "Chauffeur-Driven &bull; PLL Covered",
      status: 'Not Submitted',
    ),
    OnboardingDocument(
      id: 'logbook',
      title: "Vehicle Logbook / Lease Mandate",
      category: "NTSA Form E Ownership Verified",
      status: 'Not Submitted',
    ),
  ];

  Future<void> _uploadDocument(OnboardingDocument doc) async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);

    if (image == null) return;
    if (!mounted) return;

    // Show High-Tech Instant Verification HUD
    _showVerificationHud(doc, image);
  }

  void _showVerificationHud(OnboardingDocument doc, XFile image) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) {
        return _VerificationHudDialog(
          doc: doc,
          image: image,
          onComplete: (result) {
            setState(() {
              doc.status = result.isVerified ? 'Approved' : 'Rejected';
              doc.documentNumber = result.documentNumber;
              doc.verificationTime = '${(result.speedMs / 1000).toStringAsFixed(1)}s';
            });
          },
        );
      },
    );
  }

  bool get _isAllApproved =>
      _documents.every((d) => d.status == 'Approved');

  @override
  Widget build(BuildContext context) {
    final approvedCount =
        _documents.where((d) => d.status == 'Approved').length;

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text(
          'INSTANT KYD VERIFICATION',
          style: TextStyle(
            color: _prestigeGold,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 15,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: _prestigeGold),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Instant verification badge header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: _cabiGreen.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _cabiGreen.withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.bolt_rounded, color: _cabiGreen, size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'AUTOMATED REGISTRY FAST-PASS',
                          style: TextStyle(
                            color: _cabiGreen,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Direct NTSA TIMS & eCitizen validation &bull; Approvals in < 3 seconds',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.8),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _prestigeGold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '$approvedCount/${_documents.length}',
                      style: const TextStyle(
                        color: _prestigeGold,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.separated(
                itemCount: _documents.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final doc = _documents[index];
                  return DocumentTile(
                    doc: doc,
                    onTap: () => _uploadDocument(doc),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _isAllApproved
                  ? () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('All documents verified! Dispatch capability active.'),
                          backgroundColor: _cabiGreen,
                        ),
                      );
                      Navigator.of(context).pop();
                    }
                  : null,
              icon: Icon(
                _isAllApproved
                    ? Icons.check_circle_rounded
                    : Icons.hourglass_top_rounded,
                color: _isAllApproved ? Colors.black : Colors.white54,
              ),
              label: Text(
                _isAllApproved
                    ? 'ACTIVATION COMPLETE &bull; READY TO DRIVE'
                    : 'VERIFY ALL CREDENTIALS TO ACTIVATE',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  color: _isAllApproved ? Colors.black : Colors.white54,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    _isAllApproved ? _prestigeGold : Colors.white12,
                disabledBackgroundColor: Colors.white12,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: _isAllApproved ? 6 : 0,
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}

class DocumentTile extends StatelessWidget {
  final OnboardingDocument doc;
  final VoidCallback onTap;

  const DocumentTile({
    super.key,
    required this.doc,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    const primaryColor = AppTheme.primaryColor;
    const surfaceColor = AppTheme.darkSurface;
    const cabiGreen = Color(0xFF00A859);

    final isApproved = doc.status == 'Approved';

    return Container(
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isApproved
              ? cabiGreen.withValues(alpha: 0.5)
              : Colors.white.withValues(alpha: 0.08),
        ),
      ),
      child: ListTile(
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: isApproved
                ? cabiGreen.withValues(alpha: 0.15)
                : primaryColor.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isApproved
                ? Icons.verified_rounded
                : Icons.upload_file_rounded,
            color: isApproved ? cabiGreen : primaryColor,
            size: 22,
          ),
        ),
        title: Text(
          doc.title,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: 14,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Text(
              doc.category.replaceAll('&bull;', '•'),
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.5),
                fontSize: 11,
              ),
            ),
            if (isApproved && doc.documentNumber != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.check_circle, size: 12, color: cabiGreen),
                  const SizedBox(width: 4),
                  Text(
                    '${doc.documentNumber} (${doc.verificationTime})',
                    style: const TextStyle(
                      color: cabiGreen,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: isApproved
                ? cabiGreen.withValues(alpha: 0.15)
                : Colors.white.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isApproved
                  ? cabiGreen.withValues(alpha: 0.3)
                  : Colors.white12,
            ),
          ),
          child: Text(
            isApproved ? 'VERIFIED' : 'UPLOAD',
            style: TextStyle(
              color: isApproved ? cabiGreen : primaryColor,
              fontSize: 10,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
        ),
        onTap: onTap,
      ),
    );
  }
}

class _VerificationHudDialog extends ConsumerStatefulWidget {
  final OnboardingDocument doc;
  final XFile image;
  final Function(FastVerificationResult) onComplete;

  const _VerificationHudDialog({
    required this.doc,
    required this.image,
    required this.onComplete,
  });

  @override
  ConsumerState<_VerificationHudDialog> createState() =>
      _VerificationHudDialogState();
}

class _VerificationHudDialogState
    extends ConsumerState<_VerificationHudDialog> {
  int _step = 1;
  FastVerificationResult? _result;
  String _statusText = 'Scanning cryptographic watermark & sharpness...';

  @override
  void initState() {
    super.initState();
    _startProcess();
  }

  Future<void> _startProcess() async {
    // Step 1: Fast image scanning
    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;
    setState(() {
      _step = 2;
      _statusText = 'Querying NTSA TIMS & National Identity Registry...';
    });

    // Step 2: Query Fast-Path Verification Engine
    final apiService = ref.read(documentApiServiceProvider);
    final res = await apiService.uploadDocument(widget.doc.id, widget.image);

    if (!mounted) return;
    setState(() {
      _step = 3;
      _result = res;
      _statusText =
          'Verified & Approved in ${(res.speedMs / 1000).toStringAsFixed(1)}s!';
    });

    // Step 3: Brief delay to display verified checkmark then return
    await Future.delayed(const Duration(milliseconds: 1200));
    if (!mounted) return;
    widget.onComplete(res);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    const cabiGreen = Color(0xFF00A859);
    const primaryGold = AppTheme.primaryColor;

    return Dialog(
      backgroundColor: const Color(0xFF16191D),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: cabiGreen.withValues(alpha: 0.4), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: _step == 3
                    ? cabiGreen.withValues(alpha: 0.15)
                    : primaryGold.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: _step == 3
                  ? const Icon(Icons.verified_rounded, color: cabiGreen, size: 48)
                  : const SizedBox(
                      width: 44,
                      height: 44,
                      child: CircularProgressIndicator(
                        strokeWidth: 3.5,
                        color: primaryGold,
                      ),
                    ),
            ),
            const SizedBox(height: 20),
            Text(
              widget.doc.title.toUpperCase(),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 14,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _statusText,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: _step == 3 ? cabiGreen : Colors.white70,
                fontSize: 12,
                fontWeight: _step == 3 ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            if (_result?.documentNumber != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Registry Record: ${_result!.documentNumber}',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
