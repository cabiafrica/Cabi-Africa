import 'package:flutter/material.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Help & FAQ')),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: const [
          FaqItem(
            question: 'Why was my document rejected?',
            answer:
                'Common reasons for rejection include blurry photos, expired documents, or incorrect document types. Please check the rejection reason on the document status screen and ensure your new submission is clear and valid.',
          ),
          FaqItem(
            question: 'How long does the document review process take?',
            answer:
                'Our team typically reviews documents within 24-48 hours. You will receive a notification once the review is complete. Thank you for your patience.',
          ),
          FaqItem(
            question: 'What are the requirements for the Profile Photo?',
            answer:
                'Your profile photo should be a clear, forward-facing photo of yourself with no hats, sunglasses, or other obstructions. This photo will be visible to passengers.',
          ),
          FaqItem(
            question: 'Can I drive while my documents are pending review?',
            answer:
                'No, you must have all required documents approved before you can start accepting trips. This is for the safety and security of our platform.',
          ),
        ],
      ),
    );
  }
}

class FaqItem extends StatelessWidget {
  final String question;
  final String answer;

  const FaqItem({Key? key, required this.question, required this.answer})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8.0),
      child: ExpansionTile(
        title: Text(question, style: Theme.of(context).textTheme.titleMedium),
        children: [
          Padding(padding: const EdgeInsets.all(16.0), child: Text(answer)),
        ],
      ),
    );
  }
}
