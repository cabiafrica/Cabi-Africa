import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../services/ride_service.dart';

class IncentivesScreen extends StatefulWidget {
  final RideService? rideService;
  const IncentivesScreen({super.key, this.rideService});

  @override
  State<IncentivesScreen> createState() => _IncentivesScreenState();
}

class _IncentivesScreenState extends State<IncentivesScreen> {
  late final RideService _rideService;
  late Future<List<Map<String, dynamic>>> _incentivesFuture;

  @override
  void initState() {
    super.initState();
    _rideService = widget.rideService ?? RideService();
    _incentivesFuture = _rideService.getIncentives();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Incentives')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _incentivesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: Text(
                'No incentives available right now.',
                style: TextStyle(fontSize: 18, color: Colors.grey),
              ),
            );
          }

          final incentives = snapshot.data!;

          return ListView.builder(
            padding: const EdgeInsets.all(8.0),
            itemCount: incentives.length,
            itemBuilder: (context, index) {
              final incentive = incentives[index];
              final progress = incentive['progress'] as int;
              final goal = incentive['goal'] as int;
              final isCompleted = progress >= goal;

              return Card(
                elevation: 4,
                margin: const EdgeInsets.symmetric(vertical: 8.0),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        incentive['title'],
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(incentive['description']),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Reward: KES ${incentive['reward']}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.green,
                            ),
                          ),
                          Text(
                            'Ends: ${DateFormat.yMMMd().format(DateTime.parse(incentive['deadline']))}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (!isCompleted) ...[
                        LinearProgressIndicator(
                          value: progress / goal,
                          minHeight: 10,
                          borderRadius: BorderRadius.circular(5),
                        ),
                        const SizedBox(height: 8),
                        Text('$progress / $goal trips completed'),
                      ] else
                        const Row(
                          children: [
                            Icon(Icons.check_circle, color: Colors.green),
                            SizedBox(width: 8),
                            Text(
                              'Completed! Bonus awarded.',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
