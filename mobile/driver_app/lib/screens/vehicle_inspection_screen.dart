import 'package:flutter/material.dart';
import '../../widgets/document_expiry_card.dart';

class VehicleInspectionScreen extends StatefulWidget {
  const VehicleInspectionScreen({super.key});

  @override
  State<VehicleInspectionScreen> createState() =>
      _VehicleInspectionScreenState();
}

class _VehicleInspectionScreenState extends State<VehicleInspectionScreen> {
  // Mock data
  DateTime? _inspectionExpiryDate =
      DateTime.now().add(const Duration(days: 14));
  bool _isUploading = false;

  void _handleUpload(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Upload Inspection Report',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Please take a clear photo of your vehicle inspection report. Make sure the date and result are visible.',
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // Mock camera action
                      Navigator.pop(context);
                      _simulateUpload();
                    },
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Camera'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      foregroundColor: Colors.black,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // Mock gallery action
                      Navigator.pop(context);
                      _simulateUpload();
                    },
                    icon: const Icon(Icons.photo_library),
                    label: const Text('Gallery'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      foregroundColor: Colors.black,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _simulateUpload() async {
    setState(() {
      _isUploading = true;
    });

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      setState(() {
        _isUploading = false;
        // Update to a future date to simulate successful renewal
        _inspectionExpiryDate = DateTime.now().add(const Duration(days: 365));
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Inspection report uploaded successfully! Pending approval.'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Determine status based on date
    DocumentStatus status;
    if (_inspectionExpiryDate == null) {
      status = DocumentStatus.missing;
    } else {
      final days = _inspectionExpiryDate!.difference(DateTime.now()).inDays;
      if (days < 0) {
        status = DocumentStatus.expired;
      } else if (days < 30) {
        status = DocumentStatus.expiringSoon;
      } else {
        status = DocumentStatus.valid;
      }
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vehicle Inspection'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0.5,
      ),
      body: _isUploading
          ? const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: Colors.black),
                  SizedBox(height: 16),
                  Text('Uploading document...'),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.blue.shade100),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.shield, color: Colors.blue.shade700),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Keep your vehicle safe and compliant. Annual inspections are required.',
                          style: TextStyle(
                            color: Colors.blue.shade900,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Current Status',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                DocumentExpiryCard(
                  documentName: 'Annual Inspection Report',
                  expiryDate: _inspectionExpiryDate,
                  status: status,
                  onUpdate: () => _handleUpload(context),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Inspection History',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                _buildHistoryItem(
                  date: '2023-08-15',
                  status: 'Approved',
                  color: Colors.green,
                ),
                _buildHistoryItem(
                  date: '2022-08-10',
                  status: 'Approved',
                  color: Colors.green,
                ),
                _buildHistoryItem(
                  date: '2021-08-12',
                  status: 'Approved',
                  color: Colors.green,
                ),
              ],
            ),
    );
  }

  Widget _buildHistoryItem({
    required String date,
    required String status,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 0),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.black12)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              const Icon(Icons.history, size: 20, color: Colors.grey),
              const SizedBox(width: 12),
              Text(date, style: const TextStyle(fontWeight: FontWeight.w500)),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              status,
              style: TextStyle(
                color: color,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

