import 'package:flutter/material.dart';
import 'my_earnings_screen.dart';
import 'earnings_history_screen.dart';
import 'weekly_statements_screen.dart';
import 'earnings_goal_screen.dart';

class EarningsScreen extends StatelessWidget {
  const EarningsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Earnings'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Summary Card
            _EarningsSummaryBanner(theme: theme),

            const SizedBox(height: 24),

            Text(
              'Earnings Tools',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            // Navigation Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: [
                _EarningsNavCard(
                  icon: Icons.account_balance_wallet_outlined,
                  label: 'My Earnings',
                  subtitle: 'Summary & payout',
                  color: Colors.green.shade700,
                  bgColor: Colors.green.shade50,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const MyEarningsScreen()),
                  ),
                ),
                _EarningsNavCard(
                  icon: Icons.history,
                  label: 'Trip History',
                  subtitle: 'Past rides & fares',
                  color: Colors.blue.shade700,
                  bgColor: Colors.blue.shade50,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const EarningsHistoryScreen()),
                  ),
                ),
                _EarningsNavCard(
                  icon: Icons.receipt_long_outlined,
                  label: 'Statements',
                  subtitle: 'Weekly reports',
                  color: Colors.indigo.shade700,
                  bgColor: Colors.indigo.shade50,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const WeeklyStatementsScreen()),
                  ),
                ),
                _EarningsNavCard(
                  icon: Icons.flag_outlined,
                  label: 'Earnings Goal',
                  subtitle: 'Set & track targets',
                  color: Colors.amber.shade700,
                  bgColor: Colors.amber.shade50,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const EarningsGoalScreen()),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Tips Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: const LinearGradient(
                  colors: [Color(0xFF1A237E), Color(0xFF283593)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.lightbulb_outline,
                      color: Color(0xFFFFD700), size: 28),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Boost Your Earnings',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Drive during peak hours (7–9 AM & 5–7 PM) to earn 1.5× surge rates.',
                          style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.85),
                              fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Top banner with a live earnings snapshot.
class _EarningsSummaryBanner extends StatelessWidget {
  final ThemeData theme;
  const _EarningsSummaryBanner({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Today's Earnings",
            style: TextStyle(color: Colors.white54, fontSize: 13),
          ),
          SizedBox(height: 6),
          Text(
            'KES 1,890.50',
            style: TextStyle(
              color: Color(0xFFFFD700),
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _StatChip(label: 'Trips', value: '12'),
              _StatChip(label: 'Hours', value: '6.5'),
              _StatChip(label: 'This Week', value: 'KES 9,240'),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  const _StatChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
        const SizedBox(height: 2),
        Text(label,
            style: const TextStyle(color: Colors.white54, fontSize: 11)),
      ],
    );
  }
}

/// Individual navigation card for the grid.
class _EarningsNavCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final Color color;
  final Color bgColor;
  final VoidCallback onTap;

  const _EarningsNavCard({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.color,
    required this.bgColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.15)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(height: 8),
            Text(label,
                style: TextStyle(
                    fontWeight: FontWeight.bold, fontSize: 13, color: color)),
            Text(subtitle,
                style: const TextStyle(color: Colors.grey, fontSize: 11)),
          ],
        ),
      ),
    );
  }
}
