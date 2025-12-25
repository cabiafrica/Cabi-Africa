import 'package:flutter/material.dart';

class IncentivesScreen extends StatefulWidget {
  const IncentivesScreen({super.key});

  @override
  State<IncentivesScreen> createState() => _IncentivesScreenState();
}

class _IncentivesScreenState extends State<IncentivesScreen> {
  final List<Map<String, dynamic>> _challenges = [
    {
      'title': 'Weekend Warrior',
      'description': 'Complete 50 trips this weekend',
      'reward': 'KSh 1,000',
      'progress': 30,
      'target': 50,
      'daysLeft': 2,
      'active': true,
    },
    {
      'title': 'Morning Rush',
      'description': 'Complete 10 trips between 6 AM and 9 AM',
      'reward': 'KSh 500',
      'progress': 0,
      'target': 10,
      'daysLeft': 5,
      'active': false,
    },
    {
      'title': '5-Star Service',
      'description': 'Get 10 5-star ratings in a row',
      'reward': 'KSh 200',
      'progress': 8,
      'target': 10,
      'daysLeft': 7,
      'active': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Weekly Challenges')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _challenges.length,
        itemBuilder: (context, index) {
          final challenge = _challenges[index];
          final isActive = challenge['active'] as bool;
          final progress = challenge['progress'] as int;
          final target = challenge['target'] as int;
          final percent = progress / target;

          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(challenge['title'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Chip(
                          label: Text(challenge['reward']),
                          backgroundColor: Colors.amber.shade100,
                      )
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(challenge['description']),
                  const SizedBox(height: 16),
                  if (isActive) ...[
                      LinearProgressIndicator(value: percent, minHeight: 8, backgroundColor: Colors.grey.shade200),
                      const SizedBox(height: 8),
                      Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                              Text('$progress / $target completed'),
                              Text('${challenge['daysLeft']} days left', style: const TextStyle(color: Colors.red)),
                          ],
                      )
                  ] else ...[
                      ElevatedButton(
                          onPressed: () {
                              setState(() => challenge['active'] = true);
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Joined ${challenge['title']} challenge!')));
                          },
                          child: const Text('Opt In'),
                      )
                  ]
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
