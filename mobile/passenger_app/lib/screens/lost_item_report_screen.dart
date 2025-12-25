import 'package:flutter/material.dart';

class LostItemReportScreen extends StatefulWidget {
  final String tripId;
  final String driverName;
  
  const LostItemReportScreen({
    super.key,
    required this.tripId,
    required this.driverName,
  });

  @override
  State<LostItemReportScreen> createState() => _LostItemReportScreenState();
}

class _LostItemReportScreenState extends State<LostItemReportScreen> {
  final _formKey = GlobalKey<FormState>();
  final _itemDescriptionController = TextEditingController();
  final _contactController = TextEditingController();
  String _selectedCategory = 'Phone';
  
  final List<String> _categories = [
    'Phone',
    'Wallet',
    'Keys',
    'Bag/Backpack',
    'Clothing',
    'Electronics',
    'Documents',
    'Other',
  ];

  void _submitReport() {
    if (_formKey.currentState!.validate()) {
      // API call to create support ticket
      // NotificationService.notifyDriver(widget.tripId)
      
      Navigator.pop(context);
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 32),
              SizedBox(width: 12),
              Text('Report Submitted'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('We\'ve notified your driver and created a support ticket.'),
              const SizedBox(height: 12),
              const Text('What happens next:', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              _buildStep('1', 'Your driver will be contacted'),
              _buildStep('2', 'If found, we\'ll arrange return'),
              _buildStep('3', 'You\'ll receive updates via notifications'),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('GOT IT'),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildStep(String number, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: Colors.blue[100],
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Report Lost Item')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Trip Info
            Card(
              color: Colors.blue[50],
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Trip Information', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Text('Trip ID: ${widget.tripId}'),
                    Text('Driver: ${widget.driverName}'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Category Selection
            const Text('Item Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _categories.map((category) {
                final isSelected = _selectedCategory == category;
                return ChoiceChip(
                  label: Text(category),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() => _selectedCategory = category);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Description
            const Text('Item Description', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _itemDescriptionController,
              decoration: const InputDecoration(
                hintText: 'Describe your item in detail (color, brand, etc.)',
                border: OutlineInputBorder(),
              ),
              maxLines: 4,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please describe the item';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Contact Info
            const Text('Contact Information', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _contactController,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                hintText: 'Best number to reach you',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your contact number';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Info Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.orange[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.orange[200]!),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, color: Colors.orange[700]),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'We\'ll contact your driver immediately. If they find your item, we\'ll help coordinate the return. A small return fee may apply.',
                      style: TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            ElevatedButton(
              onPressed: _submitReport,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
              ),
              child: const Text('SUBMIT REPORT'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _itemDescriptionController.dispose();
    _contactController.dispose();
    super.dispose();
  }
}
