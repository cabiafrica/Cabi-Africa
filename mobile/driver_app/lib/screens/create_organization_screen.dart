import 'package:flutter/material.dart';

// Mock DTO - In a real app, this would be generated.
class CreateOrganizationRequestDto {
  final String name;

  CreateOrganizationRequestDto({required this.name});
}

class CreateOrganizationScreen extends StatefulWidget {
  const CreateOrganizationScreen({super.key});

  @override
  State<CreateOrganizationScreen> createState() =>
      _CreateOrganizationScreenState();
}

class _CreateOrganizationScreenState extends State<CreateOrganizationScreen> {
  final _nameController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _submitRequest() async {
    if (_nameController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an organization name.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final payload = CreateOrganizationRequestDto(name: _nameController.text);

    // Mock API call
    print('Submitting organization request for: ${payload.name}');
    await Future.delayed(const Duration(seconds: 1));

    setState(() => _isSubmitting = false);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Request submitted! You will be notified upon review.'),
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create an Organization')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Organization Name'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitRequest,
              child: Text(_isSubmitting ? 'Submitting...' : 'Submit Request'),
            ),
          ],
        ),
      ),
    );
  }
}
