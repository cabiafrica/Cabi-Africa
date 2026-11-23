import 'package:flutter/material.dart';
import '../services/support_service.dart';

class CreateTicketScreen extends StatefulWidget {
  const CreateTicketScreen({super.key});

  @override
  State<CreateTicketScreen> createState() => _CreateTicketScreenState();
}

class _CreateTicketScreenState extends State<CreateTicketScreen> {
  final _subjectController = TextEditingController();
  final _descController = TextEditingController();
  final _supportService = SupportService();
  bool _isSubmitting = false;

  String _selectedCategory = 'Payment Issue';
  final List<String> _categories = [
    'Payment Issue',
    'Lost Item',
    'Account Issue',
    'Ride Feedback',
    'Safety & Security',
    'Other'
  ];

  @override
  void dispose() {
    _subjectController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _submitTicket() async {
    final subject = _subjectController.text.trim();
    final description = _descController.text.trim();

    if (subject.isEmpty || description.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter both subject and description')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final ticket = await _supportService.createTicket(
        subject: subject,
        category: _selectedCategory,
        description: description,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ticket #${ticket.ticketNumber} created successfully!'),
            backgroundColor: Colors.green[800],
          ),
        );
        Navigator.pop(context, ticket);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error creating ticket: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Submit Support Ticket')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            children: [
              DropdownButtonFormField<String>(
                initialValue: _selectedCategory,
                decoration: const InputDecoration(labelText: 'Category'),
                items: _categories
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (val) => setState(() => _selectedCategory = val!),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _subjectController,
                decoration: const InputDecoration(
                  labelText: 'Subject',
                  hintText: 'Brief summary of the issue',
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _descController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  hintText: 'Provide details so our team can help quickly',
                ),
                maxLines: 5,
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submitTicket,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('SUBMIT TICKET', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
