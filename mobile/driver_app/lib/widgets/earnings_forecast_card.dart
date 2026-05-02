import 'package:flutter/material.dart';
import 'package:driver_app/theme/app_theme.dart';

class EarningsForecastCard extends StatelessWidget {
  final double currentWeekEarnings;
  final int daysRemaining;

  const EarningsForecastCard({
    super.key,
    required this.currentWeekEarnings,
    required this.daysRemaining,
  });

  Map<String, double> _calculateForecast() {
    // Simple forecast based on current week's pace
    final daysElapsed = 7 - daysRemaining;
    final dailyAverage =
        daysElapsed > 0 ? currentWeekEarnings / daysElapsed : 0;

    // Conservative and optimistic estimates
    final conservative =
        currentWeekEarnings + (dailyAverage * daysRemaining * 0.8);
    final optimistic =
        currentWeekEarnings + (dailyAverage * daysRemaining * 1.2);
    final projected = currentWeekEarnings + (dailyAverage * daysRemaining);

    return {
      'conservative': conservative,
      'projected': projected,
      'optimistic': optimistic,
    };
  }

  @override
  Widget build(BuildContext context) {
    final forecast = _calculateForecast();

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF212121), Color(0xFF121212)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.trending_up, color: Colors.white, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Forecast',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Weekly Estimate',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Center(
              child: Column(
                children: [
                  Text(
                    'KES ${forecast['projected']!.toStringAsFixed(0)}',
                    style: const TextStyle(
                      color: AppTheme.primaryColor,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Current: KES ${currentWeekEarnings.toStringAsFixed(0)}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                      ),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 12),
            Column(
              children: [
                _buildCompactForecastRow(
                    'Low', forecast['conservative']!, Colors.orange),
                const SizedBox(height: 4),
                _buildCompactForecastRow(
                    'High', forecast['optimistic']!, Colors.green),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCompactForecastRow(String label, double amount, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style: TextStyle(
                color: Colors.white.withValues(alpha: 0.6), fontSize: 10)),
        Text(
          'KES ${amount.toStringAsFixed(0)}',
          style: TextStyle(
              color: color, fontSize: 11, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}

