import 'package:flutter/material.dart';

// Mock service. In a real app, this would make HTTP requests.
class FeedbackService {
  Future<bool> submitFeedback(String feedback) async {
    await Future.delayed(const Duration(seconds: 1));
    print('Submitting feedback: "$feedback"');
    // In a real app, this would be a POST request to the support-service
    // to create a ticket with category: 'Suggestion'.
    return true;
  }
}

class FeedbackScreen extends StatefulWidget {
  const FeedbackScreen({super.key});

  @override
  State<FeedbackScreen> createState() => _FeedbackScreenState();
}

class _FeedbackScreenState extends State<FeedbackScreen> {
  final _feedbackService = FeedbackService();
  final _feedbackController = TextEditingController();
  bool _isLoading = false;

  Future<void> _submit() async {
    if (_feedbackController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your feedback.')),
      );
      return;
    }

    setState(() => _isLoading = true);
    final success = await _feedbackService.submitFeedback(
      _feedbackController.text,
    );
    setState(() => _isLoading = false);

    if (success) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Thank you for your feedback!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to submit feedback. Please try again.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Feedback & Suggestions')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Text(
              'We value your input. Please share any suggestions or feedback you have to help us improve.',
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _feedbackController,
              decoration: const InputDecoration(
                labelText: 'Your feedback',
                border: OutlineInputBorder(),
              ),
              maxLines: 5,
            ),
            const Spacer(),
            _isLoading
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _submit,
                    child: const Text('Submit Feedback'),
                  ),
          ],
        ),
      ),
    );
  }
}
