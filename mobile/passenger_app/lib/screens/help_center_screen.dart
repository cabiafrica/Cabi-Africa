import 'package:flutter/material.dart';

class HelpCenterScreen extends StatelessWidget {
  const HelpCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Help Center')),
      body: ListView(
        children: [
          _buildCategory(context, 'Account & Profile'),
          _buildCategory(context, 'Trips & Fares'),
          _buildCategory(context, 'Payment Methods'),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.history, color: Colors.blue),
            title: const Text('My Support Tickets'),
            onTap: () {
              // Navigation to TicketListScreen (Story 24.4)
              Navigator.pushNamed(context, '/support/history');
            },
          ),
          ListTile(
            leading: const Icon(Icons.support_agent, color: Colors.green),
            title: const Text('Contact Support'),
            onTap: () {
              // Navigation to CreateTicketScreen (Story 24.2)
              Navigator.pushNamed(context, '/support/create');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCategory(BuildContext context, String title) {
    return ExpansionTile(
      title: Text(title),
      children: const [
        ListTile(title: Text('How do I reset my password?')),
        ListTile(title: Text('How is the fare calculated?')),
      ],
    );
  }
}
