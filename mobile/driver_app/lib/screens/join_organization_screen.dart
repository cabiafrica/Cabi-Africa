import 'package:flutter/material.dart';

// Mock DTO - In a real app, this would be generated.
class JoinOrganizationRequestDto {
  final String organizationId;

  JoinOrganizationRequestDto({required this.organizationId});
}

class JoinOrganizationScreen extends StatefulWidget {
  const JoinOrganizationScreen({super.key});

  @override
  State<JoinOrganizationScreen> createState() => _JoinOrganizationScreenState();
}

class _JoinOrganizationScreenState extends State<JoinOrganizationScreen> {
  final _idController = TextEditingController();
  bool _isSubmitting = false;

  Future<void> _submitRequest() async {
    if (_idController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an organization ID.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final payload = JoinOrganizationRequestDto(
      organizationId: _idController.text,
    );

    // Mock API call
    print('Submitting request to join organization: ${payload.organizationId}');
    await Future.delayed(const Duration(seconds: 1));

    setState(() => _isSubmitting = false);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Successfully joined organization!')),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Join an Organization')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _idController,
              decoration: const InputDecoration(labelText: 'Organization ID'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitRequest,
              child: Text(
                _isSubmitting ? 'Submitting...' : 'Join Organization',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
