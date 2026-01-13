import 'package:flutter/material.dart';

class DailyGoalsCard extends StatelessWidget {
  const DailyGoalsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: Colors.white,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Daily Goals',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 12),
            _buildGoalItem('Fuel', 1500, 2000, Colors.orange),
            const SizedBox(height: 8),
            _buildGoalItem('Sacco', 300, 500, Colors.blue),
            const SizedBox(height: 8),
            _buildGoalItem('Save', 200, 1000, Colors.green),
            const SizedBox(height: 8),
            _buildGoalItem('Maintenance', 100, 300, Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildGoalItem(
      String label, double current, double target, Color color) {
    double progress = (current / target).clamp(0.0, 1.0);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label,
                style:
                    const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
            Text('${(progress * 100).toInt()}%',
                style: TextStyle(fontSize: 12, color: Colors.grey[600])),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(2),
          child: LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey[200],
            valueColor: AlwaysStoppedAnimation(color),
            minHeight: 6,
          ),
        ),
      ],
    );
  }
}
