import 'package:flutter/material.dart';
import 'package:passenger_app/widgets/referral_tree_graph.dart';
import 'package:passenger_app/theme/app_theme.dart';

class ReferralStatusScreen extends StatefulWidget {
  const ReferralStatusScreen({super.key});

  @override
  State<ReferralStatusScreen> createState() => _ReferralStatusScreenState();
}

class _ReferralStatusScreenState extends State<ReferralStatusScreen> {
  final List<Map<String, dynamic>> _referrals = [
    {
      'id': '1',
      'name': 'John D.',
      'status': 'BONUS_PAID',
      'date': DateTime.now().subtract(const Duration(days: 15)),
      'bonus': 500.0,
    },
    {
      'id': '2',
      'name': 'Sarah M.',
      'status': 'FIRST_RIDE_COMPLETED',
      'date': DateTime.now().subtract(const Duration(days: 5)),
      'bonus': 0.0,
    },
    {
      'id': '3',
      'name': 'Mike K.',
      'status': 'SIGNED_UP',
      'date': DateTime.now().subtract(const Duration(days: 2)),
      'bonus': 0.0,
    },
  ];

  double get _totalEarned => _referrals
      .where((r) => r['status'] == 'BONUS_PAID')
      .fold(0.0, (sum, r) => sum + (r['bonus'] as double));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Referrals'),
        backgroundColor: AppTheme.primaryColor,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Referral Visualization
          Center(
            child: SizedBox(
              height: 300,
              width: 300,
              child: ReferralTreeGraph(
                level1Count: 5, // Mock data
                level2Count: 12, // Mock data
                userImageUrl: 'https://i.pravatar.cc/150?u=passenger',
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Legend
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendItem("You", const Color(0xFFFFD700)),
              const SizedBox(width: 15),
              _buildLegendItem("Level 1", Colors.orange.shade700),
              const SizedBox(width: 15),
              _buildLegendItem("Level 2", Colors.orange.shade300),
            ],
          ),

          const SizedBox(height: 30),

          // Stats Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Colors.black87, Colors.black],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 4))
                ]),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem('Total Referrals', '${_referrals.length}',
                        Icons.people),
                    Container(width: 1, height: 40, color: Colors.white30),
                    _buildStatItem(
                        'Total Earned',
                        'KES ${_totalEarned.toStringAsFixed(0)}',
                        Icons.account_balance_wallet),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white24)),
                  child: Row(
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: Icon(Icons.info_outline,
                            color: AppTheme.primaryColor, size: 20),
                      ),
                      Expanded(
                        child: Text(
                          'Earn KES 500 for each friend who completes their first ride',
                          style: TextStyle(
                              color: Colors.grey.shade300, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Level 1 Referrals',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              TextButton.icon(
                onPressed: () {
                  // Share referral code
                },
                icon: const Icon(Icons.share, size: 18),
                label: const Text('Invite More'),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Referral List
          if (_referrals.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  children: [
                    Icon(Icons.people_outline,
                        size: 80, color: Colors.grey.shade400),
                    const SizedBox(height: 16),
                    Text(
                      'No referrals yet',
                      style:
                          TextStyle(fontSize: 16, color: Colors.grey.shade600),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Start inviting friends to earn bonuses!',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              ),
            )
          else
            ..._referrals.map((referral) => _buildReferralCard(referral)),

          const SizedBox(height: 24),

          // Portal Link Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                // In real app, launchUrl to portal
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('Redirecting to User Portal...')),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black,
                foregroundColor: const Color(0xFFFFBE0B), // Cabi Yellow
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'View All Network & Details in User Portal',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 28),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildReferralCard(Map<String, dynamic> referral) {
    final status = referral['status'] as String;
    final statusInfo = _getStatusInfo(status);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: statusInfo['color'].withValues(alpha: 0.1),
              child: Icon(
                statusInfo['icon'],
                color: statusInfo['color'],
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    referral['name'],
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusInfo['color'].withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          statusInfo['label'],
                          style: TextStyle(
                            color: statusInfo['color'],
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _formatDate(referral['date']),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (referral['bonus'] > 0)
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '+KES ${referral['bonus'].toStringAsFixed(0)}',
                    style: const TextStyle(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const Text(
                    'Earned',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey,
                    ),
                  ),
                ],
              )
            else
              Icon(Icons.hourglass_empty,
                  color: Colors.grey.shade400, size: 20),
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _getStatusInfo(String status) {
    switch (status) {
      case 'BONUS_PAID':
        return {
          'label': 'Bonus Paid',
          'icon': Icons.check_circle,
          'color': Colors.green,
        };
      case 'FIRST_RIDE_COMPLETED':
        return {
          'label': 'First Ride Done',
          'icon': Icons.directions_car,
          'color': Colors.blue,
        };
      case 'SIGNED_UP':
        return {
          'label': 'Signed Up',
          'icon': Icons.person_add,
          'color': Colors.orange,
        };
      default:
        return {
          'label': 'Pending',
          'icon': Icons.hourglass_empty,
          'color': Colors.grey,
        };
    }
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 4),
        Text(label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    if (diff.inDays < 30) return '${(diff.inDays / 7).floor()} weeks ago';
    return '${date.day}/${date.month}/${date.year}';
  }
}
