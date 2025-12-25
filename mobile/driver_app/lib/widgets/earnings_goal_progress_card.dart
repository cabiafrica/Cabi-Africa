import 'package:flutter/material.dart';

class EarningsGoalProgressCard extends StatelessWidget {
  final double currentEarnings;
  final double goalAmount;
  final VoidCallback onEditGoal;

  const EarningsGoalProgressCard({
    super.key,
    required this.currentEarnings,
    required this.goalAmount,
    required this.onEditGoal,
  });

  @override
  Widget build(BuildContext context) {
    // Prevent division by zero
    final double safeGoal = goalAmount > 0 ? goalAmount : 1.0;
    final double progress = (currentEarnings / safeGoal).clamp(0.0, 1.0);
    final double remaining =
        (goalAmount - currentEarnings).clamp(0.0, double.infinity);
    final bool isGoalMet = currentEarnings >= goalAmount;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: isGoalMet
                ? [Colors.green.shade50, Colors.white]
                : [Colors.blue.shade50, Colors.white],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      isGoalMet ? Icons.emoji_events : Icons.flag,
                      color: isGoalMet ? Colors.green : Colors.blue,
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Daily Goal',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87),
                    ),
                  ],
                ),
                TextButton.icon(
                  onPressed: onEditGoal,
                  icon: const Icon(Icons.edit, size: 16),
                  label: const Text('EDIT'),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.grey[700],
                    textStyle: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 12,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(
                    isGoalMet ? Colors.green : Colors.blueAccent),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '\$${currentEarnings.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const Text('Earned',
                        style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '\$${goalAmount.toStringAsFixed(0)}',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[400],
                      ),
                    ),
                    const Text('Goal',
                        style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (isGoalMet)
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.green.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.check_circle, color: Colors.green, size: 16),
                    SizedBox(width: 8),
                    Expanded(
                        child: Text('You hit your goal! Great work!',
                            style: TextStyle(
                                color: Colors.green,
                                fontWeight: FontWeight.bold))),
                  ],
                ),
              )
            else
              Text(
                'Only \$${remaining.toStringAsFixed(0)} more to reach your goal!',
                style: TextStyle(
                    color: Colors.blue[800], fontWeight: FontWeight.w500),
              ),
          ],
        ),
      ),
    );
  }
}
