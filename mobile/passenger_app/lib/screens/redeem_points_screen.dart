import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class RedeemPointsScreen extends StatefulWidget {
  const RedeemPointsScreen({super.key});

  @override
  State<RedeemPointsScreen> createState() => _RedeemPointsScreenState();
}

class _RedeemPointsScreenState extends State<RedeemPointsScreen> {
  // Syncing with backend in future iterations
  int _currentPoints = 0;

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
            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
          ),
          backgroundColor: AppTheme.primaryColor,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Insufficient points to redeem this reward.'),
          backgroundColor: AppTheme.errorRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final primaryColor = AppTheme.primaryColor;
    final backgroundColor = AppTheme.darkBackground;
    final surfaceColor = AppTheme.darkSurface;

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'REDEEM POINTS',
          style: TextStyle(
            color: primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: IconThemeData(color: primaryColor),
      ),
      body: Column(
        children: [
          _buildBalanceHeader(context, primaryColor, surfaceColor),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(24.0),
              itemCount: _rewards.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final reward = _rewards[index];
                return _buildRewardCard(context, reward, primaryColor, surfaceColor);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBalanceHeader(BuildContext context, Color primary, Color surface) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40.0, horizontal: 24),
      decoration: BoxDecoration(
        color: surface,
        border: Border(
          bottom: BorderSide(color: Colors.white.withValues(alpha: 0.05)),
        ),
      ),
      width: double.infinity,
      child: Column(
        children: [
          Text(
            'AVAILABLE BALANCE',
            style: TextStyle(
              fontSize: 10,
              color: primary.withValues(alpha: 0.6),
              letterSpacing: 2,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '$_currentPoints POINTS',
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRewardCard(
      BuildContext context, Map<String, dynamic> reward, Color primary, Color surface) {
    final bool canAfford = _currentPoints >= reward['cost'];

    return Container(
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.03)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16.0),
        title: Text(
          reward['title'],
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Text(
            '${reward['cost']} POINTS',
            style: TextStyle(
              color: primary.withValues(alpha: 0.8),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        trailing: ElevatedButton(
          onPressed: canAfford ? () => _redeemReward(reward) : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: Colors.black,
            disabledBackgroundColor: Colors.white10,
            disabledForegroundColor: Colors.white24,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            elevation: 0,
          ),
          child: const Text(
            'REDEEM',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              letterSpacing: 1,
            ),
          ),
        ),
      ),
    );
  }
}

