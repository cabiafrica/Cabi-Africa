import 'package:flutter/material.dart';

class DeliveryScreen extends StatefulWidget {
  const DeliveryScreen({super.key});

  @override
  State<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends State<DeliveryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _recipientNameController = TextEditingController();
  final _recipientPhoneController = TextEditingController();
  final _packageDescController = TextEditingController();
  final _instructionsController = TextEditingController();

  final String _pickupAddress = '123 Main St (Your Location)';
  String? _dropoffAddress;

  void _selectDropoff() async {
    // Mock address selection
    setState(() {
      _dropoffAddress = '456 Office Park, Suite 200';
    });
  }

  void _bookDelivery() {
    if (_formKey.currentState!.validate() && _dropoffAddress != null) {
      // API call to book delivery ride
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Delivery Requested'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Your delivery driver is being assigned.'),
              const SizedBox(height: 8),
              Text('Recipient: ${_recipientNameController.text}'),
              Text('Tracking link sent to: ${_recipientPhoneController.text}'),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.pop(context);
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } else if (_dropoffAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a drop-off location')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Send a Package')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Location Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    ListTile(
                      leading:
                          const Icon(Icons.my_location, color: Colors.blue),
                      title: const Text('Pickup'),
                      subtitle: Text(_pickupAddress),
                      trailing: const Icon(Icons.edit, size: 16),
                      onTap: () {}, // Edit pickup
                    ),
                    const Divider(),
                    ListTile(
                      leading: const Icon(Icons.location_on, color: Colors.red),
                      title: const Text('Drop-off'),
                      subtitle: Text(_dropoffAddress ?? 'Select destination'),
                      trailing: const Icon(Icons.search),
                      onTap: _selectDropoff,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            const Text('Recipient Details',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _recipientNameController,
              decoration: const InputDecoration(
                labelText: 'Name',
                prefixIcon: Icon(Icons.person),
                border: OutlineInputBorder(),
              ),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _recipientPhoneController,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                prefixIcon: Icon(Icons.phone),
                hintText: 'For tracking updates',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 24),

            const Text('Package Info',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _packageDescController,
              decoration: const InputDecoration(
                labelText: 'Description',
                hintText: 'e.g., Small box, Keys, Documents',
                border: OutlineInputBorder(),
              ),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _instructionsController,
              decoration: const InputDecoration(
                labelText: 'Delivery Instructions (Optional)',
                hintText: 'e.g., Leave at front desk',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),

            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _bookDelivery,
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: Colors.blue[800],
                foregroundColor: Colors.white,
              ),
              child: const Text('CONFIRM DELIVERY Request'),
            ),
            const SizedBox(height: 16),
            const Text(
              'By confirming, you agree that you are not sending any prohibited items.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _recipientNameController.dispose();
    _recipientPhoneController.dispose();
    _packageDescController.dispose();
    _instructionsController.dispose();
    super.dispose();
  }
}
