import 'package:flutter/material.dart';
import '../screens/redeem_points_screen.dart';

class LoyaltyDashboardScreen extends StatelessWidget {
  const LoyaltyDashboardScreen({Key? key}) : super(key: key);

  // Mock data for the MVP
  final int cabiPoints = 1250;
  final String currentTier = "Silver";
  final int pointsToNextTier = 2500;
  final List<Map<String, String>> recentActivity = const [
    {'description': 'Trip to Westgate Mall', 'points': '+50'},
    {'description': 'Trip to JKIA', 'points': '+120'},
    {'description': 'Trip to The Alchemist Bar', 'points': '+35'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Loyalty Rewards')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildPointsCard(context),
            const SizedBox(height: 24),
            _buildTierProgressCard(context),
            const SizedBox(height: 24),
            _buildRecentActivity(context),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const RedeemPointsScreen(),
                  ),
                );
              },
              child: const Text('Redeem Points'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPointsCard(BuildContext context) {
    return Card(
      color: Colors.blue.shade700,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Text(
              'Cabi Points Balance',
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Text(
              cabiPoints.toString(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 48,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTierProgressCard(BuildContext context) {
    final progress = cabiPoints / pointsToNextTier;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Current Tier: $currentTier',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const Text('Next: Gold', style: TextStyle(color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: progress,
              minHeight: 10,
              borderRadius: BorderRadius.circular(5),
            ),
            const SizedBox(height: 8),
            Text(
              '${pointsToNextTier - cabiPoints} points to reach Gold Tier',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Recent Activity', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 8),
        Card(
          child: Column(
            children: recentActivity.map((activity) {
              return ListTile(
                leading: const Icon(Icons.star, color: Colors.amber),
                title: Text(activity['description']!),
                trailing: Text(
                  activity['points']!,
                  style: const TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}
