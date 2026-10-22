import 'package:flutter/material.dart';

class AccountActivityLogScreen extends StatelessWidget {
  const AccountActivityLogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final activities = [
      {
        'type': 'LOGIN',
        'description': 'Login from iPhone 14',
        'location': 'Nairobi, Kenya',
        'timestamp': DateTime.now().subtract(const Duration(hours: 2)),
        'isSuccess': true,
      },
      {
        'type': 'PASSWORD_CHANGE',
        'description': 'Password changed',
        'location': 'Nairobi, Kenya',
        'timestamp': DateTime.now().subtract(const Duration(days: 3)),
        'isSuccess': true,
      },
      {
        'type': 'LOGIN',
        'description': 'Login from Chrome on Windows',
        'location': 'Nairobi, Kenya',
        'timestamp': DateTime.now().subtract(const Duration(days: 5)),
        'isSuccess': true,
      },
      {
        'type': 'PAYMENT_METHOD',
        'description': 'New payment method added',
        'location': 'Nairobi, Kenya',
        'timestamp': DateTime.now().subtract(const Duration(days: 7)),
        'isSuccess': true,
      },
      {
        'type': 'LOGIN_FAILED',
        'description': 'Failed login attempt',
        'location': 'Unknown location',
        'timestamp': DateTime.now().subtract(const Duration(days: 10)),
        'isSuccess': false,
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Account Activity'),
        backgroundColor: const Color(0xFFD4AF37),
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Info Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.blue.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.security, color: Colors.blue.shade700),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Security Activity',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.blue.shade900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Review recent security events on your account',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.blue.shade800,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          const Text(
            'Recent Activity',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),

          // Activity List
          ...activities.map((activity) => _buildActivityCard(activity)),

          const SizedBox(height: 24),

          // Security Tips
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.amber.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.amber.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.tips_and_updates, color: Colors.amber.shade700),
                    const SizedBox(width: 8),
                    Text(
                      'Security Tips',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.amber.shade900,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildTip('Enable two-factor authentication'),
                _buildTip('Use a strong, unique password'),
                _buildTip('Don\'t share your account credentials'),
                _buildTip('Review activity regularly'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityCard(Map<String, dynamic> activity) {
    final type = activity['type'] as String;
    final isSuccess = activity['isSuccess'] as bool;
    final info = _getActivityInfo(type, isSuccess);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: info['color'].withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                info['icon'],
                color: info['color'],
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    activity['description'],
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.location_on,
                          size: 14, color: Colors.grey.shade600),
                      const SizedBox(width: 4),
                      Text(
                        activity['location'],
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _formatTimestamp(activity['timestamp']),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade500,
                    ),
                  ),
                ],
              ),
            ),
            if (!isSuccess)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  'Failed',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Colors.red.shade700,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _getActivityInfo(String type, bool isSuccess) {
    if (!isSuccess) {
      return {
        'icon': Icons.error,
        'color': Colors.red,
      };
    }

    switch (type) {
      case 'LOGIN':
        return {
          'icon': Icons.login,
          'color': Colors.green,
        };
      case 'PASSWORD_CHANGE':
        return {
          'icon': Icons.lock_reset,
          'color': Colors.orange,
        };
      case 'PAYMENT_METHOD':
        return {
          'icon': Icons.credit_card,
          'color': Colors.blue,
        };
      default:
        return {
          'icon': Icons.info,
          'color': Colors.grey,
        };
    }
  }

  Widget _buildTip(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.check_circle, size: 16, color: Colors.amber.shade700),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(fontSize: 13, color: Colors.amber.shade900),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final diff = now.difference(timestamp);

    if (diff.inMinutes < 60) {
      return '${diff.inMinutes} minutes ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours} hours ago';
    } else if (diff.inDays < 7) {
      return '${diff.inDays} days ago';
    } else {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    }
  }
}

