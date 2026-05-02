import 'package:flutter/material.dart';

class FeedbackStatusNotification extends StatelessWidget {
  final String featureTitle;
  final String status;
  final VoidCallback onViewFeature;

  const FeedbackStatusNotification({
    super.key,
    required this.featureTitle,
    required this.status,
    required this.onViewFeature,
  });

  @override
  Widget build(BuildContext context) {
    final isShipped = status == 'SHIPPED';

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isShipped
              ? [Colors.green.shade400, Colors.green.shade600]
              : [Colors.blue.shade400, Colors.blue.shade600],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color:
                (isShipped ? Colors.green : Colors.blue).withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  isShipped ? Icons.celebration : Icons.update,
                  color: Colors.white,
                  size: 32,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isShipped ? 'Feature Shipped! 🎉' : 'Feature Update',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isShipped
                          ? 'Your suggestion is now live'
                          : 'Status changed to $status',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Your Suggestion:',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  featureTitle,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          if (isShipped) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.favorite, color: Colors.white, size: 20),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Thank you for helping us improve!',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onViewFeature,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.green.shade700,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'TRY IT NOW',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class FeedbackStatusScreen extends StatelessWidget {
  const FeedbackStatusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final notifications = [
      {
        'title': 'Dark mode for passenger app',
        'status': 'SHIPPED',
        'date': DateTime.now().subtract(const Duration(days: 2)),
      },
      {
        'title': 'Split fare feature',
        'status': 'PLANNED',
        'date': DateTime.now().subtract(const Duration(days: 5)),
      },
      {
        'title': 'In-app chat with driver',
        'status': 'UNDER_REVIEW',
        'date': DateTime.now().subtract(const Duration(days: 10)),
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Feedback'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: notifications.length,
        itemBuilder: (context, index) {
          final item = notifications[index];
          return _buildFeedbackCard(context, item);
        },
      ),
    );
  }

  Widget _buildFeedbackCard(BuildContext context, Map<String, dynamic> item) {
    final status = item['status'] as String;
    final statusInfo = _getStatusInfo(status);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: statusInfo['color'].withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        statusInfo['icon'],
                        size: 16,
                        color: statusInfo['color'],
                      ),
                      const SizedBox(width: 6),
                      Text(
                        statusInfo['label'],
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: statusInfo['color'],
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                Text(
                  _formatDate(item['date']),
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              item['title'],
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (status == 'SHIPPED') ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.celebration,
                      size: 18, color: Colors.green.shade700),
                  const SizedBox(width: 6),
                  Text(
                    'This feature is now available!',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.green.shade700,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _getStatusInfo(String status) {
    switch (status) {
      case 'SHIPPED':
        return {
          'label': 'Shipped',
          'icon': Icons.check_circle,
          'color': Colors.green,
        };
      case 'PLANNED':
        return {
          'label': 'Planned',
          'icon': Icons.schedule,
          'color': Colors.purple,
        };
      case 'UNDER_REVIEW':
        return {
          'label': 'Under Review',
          'icon': Icons.visibility,
          'color': Colors.blue,
        };
      default:
        return {
          'label': 'New',
          'icon': Icons.fiber_new,
          'color': Colors.orange,
        };
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inDays == 0) return 'Today';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays} days ago';
    return '${date.day}/${date.month}/${date.year}';
  }
}

