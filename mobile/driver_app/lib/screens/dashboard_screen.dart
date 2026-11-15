import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/providers/theme_provider.dart';
import 'package:driver_app/widgets/driver_analytics_cards.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:qr_flutter/qr_flutter.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authState = ref.watch(authProvider);
    final user = authState is Authenticated ? authState.user : null;
    final driverProfile = user?['driverProfile'] as Map<String, dynamic>?;
    final acceptanceRate = (driverProfile?['acceptanceRate'] ?? user?['acceptanceRate'] ?? '0%').toString();
    final cancellationRate = (driverProfile?['cancellationRate'] ?? user?['cancellationRate'] ?? '0%').toString();
    final hoursOnline = (driverProfile?['hoursOnline'] ?? user?['hoursOnline'] ?? '0h').toString();
    final totalTrips = (driverProfile?['totalTrips'] ?? user?['totalTrips'] ?? '0').toString();
    final rawRef = (user?['referralCode'] ?? driverProfile?['referralCode'] ?? user?['id'] ?? 'DRIVER').toString();
    final referralCode = rawRef.length > 10 ? 'DRV-${rawRef.substring(0, 6).toUpperCase()}' : rawRef;
    final fullName = (user?['fullName'] ?? user?['name'] ?? 'Driver').toString().trim();
    final firstName = fullName.isNotEmpty ? fullName.split(' ').first : 'Driver';
    final initials = fullName.isNotEmpty
        ? fullName
            .split(' ')
            .where((e) => e.isNotEmpty)
            .take(2)
            .map((e) => e[0].toUpperCase())
            .join()
        : 'CD';
    final tierLabel = (driverProfile?['tier'] ?? 'CABI PARTNER').toString().toUpperCase();
    final isOnline = driverProfile?['isOnline'] == true;
    final todayEarnings = double.tryParse(
          (driverProfile?['todayEarnings'] ?? user?['todayEarnings'] ?? 0).toString(),
        ) ??
        0.0;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.obsidianCanvas : AppTheme.porcelainCanvas,
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.space_dashboard_rounded,
                color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze,
                size: 18,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Driver Cockpit',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 18,
                color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
              ),
            ),
          ],
        ),
        backgroundColor: isDark ? AppTheme.obsidianCanvas : Colors.white,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: isDark ? Colors.white : AppTheme.porcelainTextPrimary),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: InkWell(
              onTap: () => ref.read(themeProvider.notifier).toggleTheme(),
              borderRadius: BorderRadius.circular(18),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurfaceContainer,
                  border: Border.all(
                    color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline,
                  ),
                ),
                child: Icon(
                  isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                  size: 18,
                  color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze,
                ),
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stitch Driver Cockpit HUD Overview Panel
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.28 : 0.04),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: AppTheme.goldGradient,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          initials,
                          style: const TextStyle(
                            color: Color(0xFF241A00),
                            fontWeight: FontWeight.w900,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    'Hi, $firstName',
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryColor.withValues(alpha: 0.16),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    tierLabel,
                                    style: TextStyle(
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w800,
                                      color: isDark ? AppTheme.primaryLight : AppTheme.aurumBronze,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Container(
                                  width: 7,
                                  height: 7,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isOnline ? AppTheme.successGreen : Colors.grey,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '${isOnline ? "Online" : "Standby"}  •  GPS High  •  4G+ Live',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: isDark ? AppTheme.warmStone : AppTheme.porcelainTextSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.obsidianCanvas : AppTheme.porcelainSurfaceContainer,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "TODAY'S REVENUE",
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.8,
                                color: isDark ? AppTheme.warmStone : AppTheme.porcelainTextSecondary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'KES ${todayEarnings.toStringAsFixed(2)}',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                                color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppTheme.successGreen.withValues(alpha: 0.14),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '$totalTrips Trips',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.successGreen,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Score Matrix & Tier Overview
            const DriverAnalyticsCards(),
            const SizedBox(height: 24),

            // Additional Metrics Section Header
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
                Text(
                  'Operational Metrics',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurface,
                    letterSpacing: 0.2,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Metrics Grid
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 14,
              mainAxisSpacing: 14,
              childAspectRatio: 1.35,
              children: [
                _buildMetricCard(
                  context,
                  'Acceptance Rate',
                  acceptanceRate.contains('%') ? acceptanceRate : '$acceptanceRate%',
                  AppTheme.successGreen,
                  Icons.task_alt_rounded,
                  'Qualifying Trips',
                ),
                _buildMetricCard(
                  context,
                  'Cancellation Rate',
                  cancellationRate.contains('%') ? cancellationRate : '$cancellationRate%',
                  AppTheme.secondaryAmber,
                  Icons.cancel_outlined,
                  'Target Below 4%',
                ),
                _buildMetricCard(
                  context,
                  'Hours Online',
                  hoursOnline,
                  AppTheme.primaryColor,
                  Icons.access_time_filled_rounded,
                  'This Week Total',
                ),
                _buildMetricCard(
                  context,
                  'Total Trips',
                  totalTrips,
                  AppTheme.primaryDark,
                  Icons.local_taxi_rounded,
                  'All-Time Completed',
                ),
              ],
            ),
            const SizedBox(height: 28),

            // Luxury Referral & Growth Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDark
                      ? [
                          const Color(0xFF1E1A12),
                          const Color(0xFF141414),
                        ]
                      : [
                          const Color(0xFFFFFDF7),
                          const Color(0xFFF9F6ED),
                        ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: AppTheme.primaryColor.withValues(alpha: 0.35),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryColor.withValues(alpha: 0.08),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.card_giftcard_rounded,
                        color: AppTheme.primaryDark,
                        size: 22,
                      ),
                      const SizedBox(width: 8),
                      ShaderMask(
                        shaderCallback: (bounds) =>
                            AppTheme.goldGradient.createShader(bounds),
                        child: const Text(
                          'Refer Partner & Earn Bonus',
                          style: TextStyle(
                            fontSize: 19,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Invite driver colleagues to CABI Africa. Receive guaranteed commission vouchers when they complete 20 rides.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isDark ? Colors.grey.shade400 : Colors.grey.shade700,
                      fontSize: 12.5,
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Styled QR Frame with Gold border
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppTheme.primaryColor.withValues(alpha: 0.5),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.2),
                          blurRadius: 14,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: QrImageView(
                      data: 'https://portal.cabiapp.africa/register/driver?ref=$referralCode',
                      version: QrVersions.auto,
                      size: 160.0,
                    ),
                  ),
                  const SizedBox(height: 20),
                  // Copyable Link Container
                  InkWell(
                    onTap: () {
                      Clipboard.setData(
                        ClipboardData(
                            text: 'https://portal.cabiapp.africa/ref/$referralCode'),
                      );
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text(
                            'Referral link copied to clipboard!',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          backgroundColor: AppTheme.primaryDark,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isDark
                            ? Colors.white.withValues(alpha: 0.05)
                            : Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: AppTheme.primaryColor.withValues(alpha: 0.3),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.link_rounded,
                            size: 18,
                            color: AppTheme.primaryDark,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'portal.cabiapp.africa/ref/$referralCode',
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 10),
                          const Icon(
                            Icons.copy_rounded,
                            size: 16,
                            color: AppTheme.primaryDark,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 36),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(
    BuildContext context,
    String title,
    String value,
    Color color,
    IconData icon,
    String subtitle,
  ) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context).cardTheme.color ?? Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppTheme.primaryColor.withValues(alpha: 0.18),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.85),
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 10,
                  color: AppTheme.primaryDark.withValues(alpha: 0.8),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
