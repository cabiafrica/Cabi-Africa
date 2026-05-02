import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../screens/redeem_points_screen.dart';

class LoyaltyDashboardScreen extends StatefulWidget {
  const LoyaltyDashboardScreen({super.key});

  @override
  State<LoyaltyDashboardScreen> createState() => _LoyaltyDashboardScreenState();
}

class _LoyaltyDashboardScreenState extends State<LoyaltyDashboardScreen> {
  // These will be fetched from a service in the next iteration
  final int cabiPoints = 0;
  final String currentTier = "ELITE";
  final int pointsToNextTier = 5000;
  final List<Map<String, String>> recentActivity = [];

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
          'LOYALTY REWARDS',
          style: TextStyle(
            color: primaryColor,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 14,
          ),
        ),
        iconTheme: IconThemeData(color: primaryColor),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildPointsCard(context, primaryColor, surfaceColor),
            const SizedBox(height: 32),
            _buildTierProgressCard(context, primaryColor, surfaceColor),
            const SizedBox(height: 32),
            _buildRecentActivity(context, primaryColor, surfaceColor),
            const SizedBox(height: 48),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const RedeemPointsScreen(),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: const Text(
                'REDEEM PRESTIGE POINTS',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildPointsCard(BuildContext context, Color primary, Color surface) {
    return Container(
      padding: const EdgeInsets.all(32.0),
      decoration: BoxDecoration(
        color: surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: primary.withValues(alpha: 0.1)),
        boxShadow: [
          BoxShadow(
            color: primary.withValues(alpha: 0.05),
            blurRadius: 40,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            'CABI POINTS BALANCE',
            style: TextStyle(
              color: primary.withValues(alpha: 0.6),
              fontSize: 10,
              letterSpacing: 2,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            cabiPoints.toString(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 56,
              fontWeight: FontWeight.bold,
              letterSpacing: -1,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'AVAILABLE FOR REDEMPTION',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.2),
              fontSize: 9,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTierProgressCard(
      BuildContext context, Color primary, Color surface) {
    final progress = pointsToNextTier == 0 ? 0.0 : cabiPoints / pointsToNextTier;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'TIER STATUS: $currentTier',
              style: TextStyle(
                color: primary,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
            Text(
              'NEXT: PLATINUM',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.3),
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            backgroundColor: Colors.white.withValues(alpha: 0.05),
            valueColor: AlwaysStoppedAnimation<Color>(primary),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          '${pointsToNextTier - cabiPoints} points until your next status upgrade',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.4),
            fontSize: 11,
          ),
        ),
      ],
    );
  }

  Widget _buildRecentActivity(
      BuildContext context, Color primary, Color surface) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'RECENT ACTIVITY',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.6),
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 16),
        if (recentActivity.isEmpty)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 40),
            width: double.infinity,
            decoration: BoxDecoration(
              color: surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.03)),
            ),
            child: Column(
              children: [
                Icon(Icons.history_rounded,
                    color: Colors.white.withValues(alpha: 0.1), size: 32),
                const SizedBox(height: 12),
                Text(
                  'No recent points activity',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.2),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          )
        else
          ...recentActivity.map((activity) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                color: surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.03)),
              ),
              child: ListTile(
                leading: Icon(Icons.stars_rounded, color: primary, size: 22),
                title: Text(
                  activity['description']!,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500),
                ),
                trailing: Text(
                  activity['points']!,
                  style: TextStyle(
                    color: primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            );
          }),
      ],
    );
  }
}

