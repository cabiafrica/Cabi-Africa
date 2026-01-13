import 'package:flutter/material.dart';

class EarningsGoalProgressCard extends StatefulWidget {
  final double currentEarnings;
  final double goalAmount; // Daily Goal
  final double? weeklyGoal;
  final double? monthlyGoal;
  final VoidCallback onEditGoal;

  const EarningsGoalProgressCard({
    super.key,
    required this.currentEarnings,
    required this.goalAmount,
    this.weeklyGoal,
    this.monthlyGoal,
    required this.onEditGoal,
  });

  @override
  State<EarningsGoalProgressCard> createState() =>
      _EarningsGoalProgressCardState();
}

class _EarningsGoalProgressCardState extends State<EarningsGoalProgressCard>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      setState(() {
        _currentIndex = _tabController.index;
      });
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Determine current goal based on tab index
    double currentGoal = widget.goalAmount;
    String label = "Daily Goal";

    // Mock earnings scaling for demo purposes (since we only receive one currentEarnings value)
    // In a real app, you'd pass distinct earnings for day/week/month.
    double relevantEarnings = widget.currentEarnings;

    if (_currentIndex == 1) {
      currentGoal = widget.weeklyGoal ?? widget.goalAmount * 7;
      label = "Weekly Goal";
      relevantEarnings =
          widget.currentEarnings * 5; // Mock: 5x earnings for week
    } else if (_currentIndex == 2) {
      currentGoal = widget.monthlyGoal ?? widget.goalAmount * 30;
      label = "Monthly Goal";
      relevantEarnings =
          widget.currentEarnings * 20; // Mock: 20x earnings for month
    }

    final double safeGoal = currentGoal > 0 ? currentGoal : 1.0;
    final double progress = (relevantEarnings / safeGoal).clamp(0.0, 1.0);
    final int percentage = (progress * 100).toInt();
    final double remaining =
        (currentGoal - relevantEarnings).clamp(0.0, double.infinity);
    final bool isGoalMet = relevantEarnings >= currentGoal;

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
                : const [Color(0xFFFFF8E1), Colors.white],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Tabs Implementation
            Container(
              height: 36,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(18),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  borderRadius: BorderRadius.circular(18),
                  color: Colors.black, // Cabi Black
                ),
                labelColor: const Color(0xFFFFBE0B), // Cabi Yellow text
                unselectedLabelColor: Colors.grey.shade600,
                labelStyle:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                tabs: const [
                  Tab(text: "Daily"),
                  Tab(text: "Weekly"),
                  Tab(text: "Monthly"),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      isGoalMet ? Icons.emoji_events : Icons.flag,
                      color: isGoalMet ? Colors.green : const Color(0xFFFFD700),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      label,
                      style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87),
                    ),
                  ],
                ),
                TextButton.icon(
                  onPressed: widget.onEditGoal,
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
            Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("$percentage%",
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: progress,
                    minHeight: 12,
                    backgroundColor: Colors.grey[200],
                    valueColor: AlwaysStoppedAnimation<Color>(
                        isGoalMet ? Colors.green : const Color(0xFFFFD700)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'KES ${relevantEarnings.toStringAsFixed(0)}',
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
                      'KES ${currentGoal.toStringAsFixed(0)}',
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
                child: const Row(
                  children: [
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
                'Only KES ${remaining.toStringAsFixed(0)} more to reach your goal!',
                style: const TextStyle(
                    color: Colors.black54, fontWeight: FontWeight.w500),
              ),
          ],
        ),
      ),
    );
  }
}
