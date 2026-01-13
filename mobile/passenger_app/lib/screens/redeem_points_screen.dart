import 'package:flutter/material.dart';

class RedeemPointsScreen extends StatefulWidget {
  const RedeemPointsScreen({super.key});

  @override
  State<RedeemPointsScreen> createState() => _RedeemPointsScreenState();
}

class _RedeemPointsScreenState extends State<RedeemPointsScreen> {
  // Mock data - in a real app, this would come from a service/provider
  int _currentPoints = 1250;

  final List<Map<String, dynamic>> _rewards = [
    {'id': '1', 'title': '100 KES Off Next Ride', 'cost': 500},
    {'id': '2', 'title': '250 KES Off Next Ride', 'cost': 1000},
    {'id': '3', 'title': 'Free Ride (up to 1000 KES)', 'cost': 3000},
    {'id': '4', 'title': '50% Off Next 3 Rides', 'cost': 5000},
  ];

  void _redeemReward(Map<String, dynamic> reward) {
    final int cost = reward['cost'];
    if (_currentPoints >= cost) {
      setState(() {
        _currentPoints -= cost;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Redeemed "${reward['title']}"! Coupon added to wallet.',
          ),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Insufficient points to redeem this reward.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Redeem Points')),
      body: Column(
        children: [
          _buildBalanceHeader(context),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16.0),
              itemCount: _rewards.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final reward = _rewards[index];
                return _buildRewardCard(context, reward);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24.0),
      color: Colors.blue.shade50,
      width: double.infinity,
      child: Column(
        children: [
          const Text(
            'Available Balance',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
          const SizedBox(height: 8),
          Text(
            '$_currentPoints Points',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).primaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRewardCard(BuildContext context, Map<String, dynamic> reward) {
    final bool canAfford = _currentPoints >= reward['cost'];

    return Card(
      elevation: 2,
      child: ListTile(
        contentPadding: const EdgeInsets.all(16.0),
        title: Text(
          reward['title'],
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(
          '${reward['cost']} Points',
          style: const TextStyle(color: Colors.grey),
        ),
        trailing: ElevatedButton(
          onPressed: canAfford ? () => _redeemReward(reward) : null,
          child: const Text('Redeem'),
        ),
      ),
    );
  }
}
