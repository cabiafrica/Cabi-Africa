import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/config/app_config.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/widgets/secure_webview.dart';

class DriverAnalyticsCards extends ConsumerWidget {
  const DriverAnalyticsCards({super.key});

  void _openUserPortal(BuildContext context) {
    openSecurePortalSheet(
      context,
      url: '${AppConfig.userPortalUrl}/portal/analytics',
      title: 'Comprehensive Score Matrix',
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState is Authenticated ? authState.user : null;
    final driverProfile = user?['driverProfile'] as Map<String, dynamic>?;
    final tierLabel = (user?['tier'] ?? driverProfile?['tier'] ?? 'STANDARD DRIVER').toString().toUpperCase();
    final badgesCount = (driverProfile?['badgesCount'] ?? user?['badgesCount'] ?? 0).toString();
    final pointsVal = (driverProfile?['points'] ?? user?['points'] ?? 0) as num;
    final ratingVal = driverProfile?['rating'] ?? user?['rating'];
    final ratingDisplay = ratingVal != null ? '$ratingVal ★' : 'New ★';
    final acceptanceDisplay = (driverProfile?['acceptanceRate'] ?? user?['acceptanceRate'] ?? '0%').toString();
    final driverScoreDisplay = (driverProfile?['driverScore'] ?? user?['driverScore'] ?? '0%').toString();
    final weeklyEarnings = (driverProfile?['weeklyEarnings'] ?? user?['weeklyEarnings'] ?? 0) as num;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title Row
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 4,
                    height: 20,
                    decoration: BoxDecoration(
                      gradient: AppTheme.goldGradient,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Score Matrix',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.2,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 6),

        // 1. Luxury Gold Tier Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [
                Color(0xFF1C1914), // Dark obsidian with warm gold undertones
                Color(0xFF2B2417),
                Color(0xFF141310),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: AppTheme.primaryColor.withValues(alpha: 0.45),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.15),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.4),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      gradient: AppTheme.goldGradient,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.workspace_premium_rounded,
                          color: Colors.black,
                          size: 15,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          tierLabel,
                          style: const TextStyle(
                            color: Colors.black,
                            fontWeight: FontWeight.w800,
                            fontSize: 11,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: AppTheme.primaryLight.withValues(alpha: 0.25),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.military_tech_rounded,
                          color: AppTheme.primaryLight,
                          size: 20,
                        ),
                        const SizedBox(width: 6),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              badgesCount,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                height: 1.1,
                              ),
                            ),
                            const Text(
                              'Badges',
                              style: TextStyle(
                                color: AppTheme.primaryLight,
                                fontSize: 10,
                                height: 1.1,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  ShaderMask(
                    shaderCallback: (bounds) =>
                        AppTheme.goldGradient.createShader(bounds),
                    child: Text(
                      pointsVal.toStringAsFixed(0),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 34,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Points',
                    style: TextStyle(
                      color: AppTheme.primaryLight,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              // Progress towards Platinum Tier
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Progress to Next Tier',
                        style: TextStyle(
                          color: Colors.grey.shade400,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        '${(3000 - pointsVal).clamp(0, 3000).toStringAsFixed(0)} pts remaining',
                        style: const TextStyle(
                          color: AppTheme.primaryLight,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      height: 8,
                      width: double.infinity,
                      color: Colors.white.withValues(alpha: 0.1),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: (pointsVal / 3000.0).clamp(0.02, 1.0),
                        child: Container(
                          decoration: const BoxDecoration(
                            gradient: AppTheme.goldGradient,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 2. Core Driver Metrics Grid (Rating, Acceptance Rate, Driver Score)
        Row(
          children: [
            Expanded(
              child: _buildMatrixCard(
                context,
                Icons.star_rounded,
                AppTheme.primaryColor,
                ratingDisplay,
                'Driver Rating',
                'Passenger Exp.',
                infoText: 'Driver Rating: The overall 5-star rating calculated from passenger feedback and ride reviews.',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildMatrixCard(
                context,
                Icons.check_circle_rounded,
                AppTheme.successGreen,
                acceptanceDisplay.contains('%') ? acceptanceDisplay : '$acceptanceDisplay%',
                'Acceptance Rate',
                'Qualifying (100)',
                infoText: 'Acceptance Rate: Out of 100 qualifying trips (trips within your pickup radius & preferred destination), how many trips you have taken vs passed. Non-qualifying trips do not penalize your rate.',
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildMatrixCard(
                context,
                Icons.speed_rounded,
                AppTheme.secondaryAmber,
                driverScoreDisplay.contains('%') ? driverScoreDisplay : '$driverScoreDisplay%',
                'Driver Score',
                'Completed (100)',
                infoText: 'Driver Score: Out of 100 recent trips that you have accepted, how many you have successfully completed without driver-initiated cancellations.',
              ),
            ),
          ],
        ),

        const SizedBox(height: 14),

        // 3. Earnings & Analytics Bars
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Theme.of(context).cardTheme.color ?? Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: AppTheme.primaryColor.withValues(alpha: 0.16),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(
                        Icons.bar_chart_rounded,
                        color: AppTheme.primaryDark,
                        size: 20,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Weekly Earnings Activity',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppTheme.primaryColor.withValues(alpha: 0.25),
                      ),
                    ),
                    child: const Text(
                      'Last 7 Days',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryDark,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  _buildBar('Mon', 8),
                  _buildBar('Tue', 8),
                  _buildBar('Wed', 8),
                  _buildBar('Thu', 8),
                  _buildBar('Fri', 8),
                  _buildBar('Sat', 8),
                  _buildBar('Sun', 8),
                ],
              ),
              const SizedBox(height: 18),
              Divider(color: AppTheme.primaryColor.withValues(alpha: 0.15)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Total Weekly Earnings',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'KES ${weeklyEarnings.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Row(
                      children: [
                        Icon(
                          Icons.trending_up_rounded,
                          size: 16,
                          color: AppTheme.successGreen,
                        ),
                        SizedBox(width: 4),
                        Text(
                          'Live Ledger',
                          style: TextStyle(
                            color: AppTheme.successGreen,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              )
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 4. Optimization Insight Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFDF5),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppTheme.primaryColor.withValues(alpha: 0.35),
            ),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.06),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: AppTheme.goldGradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.3),
                      blurRadius: 6,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.tips_and_updates_rounded,
                  color: Colors.black,
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'High Demand Opportunity',
                      style: TextStyle(
                        color: Color(0xFF926F15),
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '2 peak-surge requests were missed yesterday. Staying online between 5 PM – 7 PM can boost daily earnings by ~KES 1,450.',
                      style: TextStyle(
                        color: Colors.grey.shade800,
                        fontSize: 12.5,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 18),

        // 5. Portal Button
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: () => _openUserPortal(context),
            icon: const Icon(
              Icons.analytics_outlined,
              size: 20,
              color: Colors.black,
            ),
            label: const Text(
              'Comprehensive Score Matrix',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14.5,
                color: Colors.black,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryColor,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              elevation: 2,
              shadowColor: AppTheme.primaryColor.withValues(alpha: 0.4),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMatrixCard(
    BuildContext context,
    IconData icon,
    Color color,
    String value,
    String label,
    String subtitle, {
    String? infoText,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          if (infoText != null) {
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                backgroundColor: const Color(0xFF1E1B15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                  side: BorderSide(color: color.withValues(alpha: 0.5), width: 1),
                ),
                title: Row(
                  children: [
                    Icon(icon, color: color, size: 24),
                    const SizedBox(width: 8),
                    Text(
                      label,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ],
                ),
                content: Text(
                  infoText,
                  style: const TextStyle(color: Colors.white70, fontSize: 13.5, height: 1.45),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('Close', style: TextStyle(color: AppTheme.primaryColor)),
                  ),
                ],
              ),
            );
          }
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            color: Theme.of(context).cardTheme.color ?? Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppTheme.primaryColor.withValues(alpha: 0.16),
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 8),
              Text(
                value,
                style: const TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 16,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade600,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w500,
                  color: color.withValues(alpha: 0.9),
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBar(String day, double percentage,
      {bool isActive = false, String? labelValue}) {
    return Column(
      children: [
        if (labelValue != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            margin: const EdgeInsets.only(bottom: 4),
            decoration: BoxDecoration(
              gradient: AppTheme.goldGradient,
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              labelValue,
              style: const TextStyle(
                fontSize: 8.5,
                fontWeight: FontWeight.w900,
                color: Colors.black,
              ),
            ),
          )
        else
          const SizedBox(height: 16),
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            Container(
              height: 100,
              width: 12,
              decoration: BoxDecoration(
                color: Colors.grey.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            Container(
              height: 100 * (percentage / 100),
              width: 12,
              decoration: BoxDecoration(
                gradient: isActive
                    ? AppTheme.goldGradient
                    : const LinearGradient(
                        colors: [Color(0xFF333333), Color(0xFF1E1E1E)],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                borderRadius: BorderRadius.circular(6),
                boxShadow: isActive
                    ? [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.4),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        )
                      ]
                    : null,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          day,
          style: TextStyle(
            fontSize: 11,
            color: isActive ? AppTheme.primaryDark : Colors.grey.shade600,
            fontWeight: isActive ? FontWeight.w800 : FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
