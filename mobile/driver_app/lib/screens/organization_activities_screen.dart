import 'package:flutter/material.dart';

class OrganizationActivitiesScreen extends StatelessWidget {
  const OrganizationActivitiesScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Mock Data
    final activities = [
      {
        'title': 'Monthly Safety Briefing',
        'description': 'Mandatory safety update for all drivers.',
        'date': '2024-05-20 14:00'
      },
      {
        'title': 'Weekend Earnings Quest',
        'description': 'Hit 20 trips this weekend for a bonus.',
        'date': '2024-05-24 00:00'
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Organization'),
        backgroundColor: Colors.deepPurple,
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            color: Colors.deepPurple.shade50,
            width: double.infinity,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Nairobi Drivers Union',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Member since Jan 2024',
                  style: TextStyle(color: Colors.grey.shade700),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: const Text(
              'Upcoming Activities',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: activities.length,
              itemBuilder: (context, index) {
                final activity = activities[index];
                return Card(
                  margin:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    title: Text(activity['title']!),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        Text(activity['description']!),
                        const SizedBox(height: 8),
                        Text(
                          activity['date']!,
                          style: const TextStyle(
                            color: Colors.deepPurple,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    isThreeLine: true,
                    trailing: ElevatedButton(
                      onPressed: () {
                        // Note: Call backend RSVP API
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('RSVP Successful!')),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.deepPurple,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('RSVP'),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
