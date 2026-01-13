import 'package:flutter/material.dart';
import '../../widgets/document_expiry_card.dart';

class VehicleDocumentsScreen extends StatefulWidget {
  final String vehicleId;
  final String vehicleName;

  const VehicleDocumentsScreen({
    super.key,
    required this.vehicleId,
    required this.vehicleName,
  });

  @override
  State<VehicleDocumentsScreen> createState() => _VehicleDocumentsScreenState();
}

class _VehicleDocumentsScreenState extends State<VehicleDocumentsScreen> {
  // Mock document data
  final List<Map<String, dynamic>> _documents = [
    {
      'id': 'd1',
      'name': 'Vehicle Registration',
      'expiry': DateTime.now().add(const Duration(days: 200)),
      'status': DocumentStatus.valid,
    },
    {
      'id': 'd2',
      'name': 'Commercial Insurance',
      'expiry': DateTime.now().add(const Duration(days: 15)),
      'status': DocumentStatus.expiringSoon,
    },
    {
      'id': 'd3',
      'name': 'Inspection Report',
      'expiry': DateTime.now().subtract(const Duration(days: 2)),
      'status': DocumentStatus.expired,
    },
    {
      'id': 'd4',
      'name': 'Permit',
      'expiry': null,
      'status': DocumentStatus.missing,
    },
  ];

  void _handleUpdate(String docId) {
    // Simulate update flow
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Update ${_documents.firstWhere((d) => d['id'] == docId)['name']}',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(context);
                _simulateUploadSuccess(docId);
              },
              icon: const Icon(Icons.cloud_upload),
              label: const Text('Upload Document'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
                backgroundColor: Colors.black,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _simulateUploadSuccess(String docId) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Document uploaded successfully! Pending review.'),
        backgroundColor: Colors.green,
      ),
    );
    
    // Optimistic update
    setState(() {
      final index = _documents.indexWhere((d) => d['id'] == docId);
      if (index != -1) {
        _documents[index] = {
          ..._documents[index],
          'status': DocumentStatus.valid,
          'expiry': DateTime.now().add(const Duration(days: 365)),
        };
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text(widget.vehicleName),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Header Summary
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.black,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
            ),
            child: Row(
              children: [
                const Icon(Icons.folder_shared, color: Color(0xFFFBBF24), size: 32),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Vehicle Documents',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Manage required paperwork for this vehicle',
                        style: TextStyle(
                          color: Colors.grey.shade400,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.only(top: 16, bottom: 24),
              itemCount: _documents.length,
              itemBuilder: (context, index) {
                final doc = _documents[index];
                return DocumentExpiryCard(
                  documentName: doc['name'],
                  expiryDate: doc['expiry'],
                  status: doc['status'],
                  onUpdate: () => _handleUpdate(doc['id']),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
