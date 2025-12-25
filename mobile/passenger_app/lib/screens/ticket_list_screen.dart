import 'package:flutter/material.dart';

class TicketListScreen extends StatelessWidget {
  const TicketListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Mock data
    final tickets = [
      {'id': '1', 'subject': 'Charged twice', 'status': 'NEW', 'date': '2024-05-10'},
      {'id': '2', 'subject': 'Lost umbrella', 'status': 'RESOLVED', 'date': '2024-04-20'},
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Support History')),
      body: ListView.builder(
        itemCount: tickets.length,
        itemBuilder: (context, index) {
          final t = tickets[index];
          return ListTile(
            title: Text(t['subject']!),
            subtitle: Text('Status: ${t['status']} - ${t['date']}'),
            onTap: () {
              // Navigate to detail
              Navigator.pushNamed(context, '/support/ticket/${t['id']}');
            },
          );
        },
      ),
    );
  }
}
