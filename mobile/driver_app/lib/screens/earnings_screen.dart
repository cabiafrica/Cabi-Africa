import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'my_earnings_screen.dart';
import 'earnings_history_screen.dart';
import 'earnings_statements_screen.dart';
import 'earnings_goal_screen.dart';

class EarningsScreen extends StatelessWidget {
  const EarningsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainCanvas,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF141416) : AppTheme.porcelainSurface,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: isDark ? Colors.white : AppTheme.porcelainTextPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Earnings',
          style: AppTheme.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.35)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.verified_user_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 14),
                const SizedBox(width: 4),
                Text(
                  'M-Pesa Verified',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Stitch Executive Shift Summary Telemetry Bar ──
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(Icons.timer_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 20),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Online Span',
                              style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
                            ),
                            Text(
                              '8h 30m',
                              style: AppTheme.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: isDark ? Colors.white : AppTheme.porcelainTextPrimary),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Container(width: 1, height: 32, color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppTheme.successGreen.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.commute_rounded, color: AppTheme.successGreen, size: 20),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'In-Ride (78%)',
                              style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
                            ),
                            Text(
                              '6h 40m',
                              style: AppTheme.outfit(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.successGreen,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ── Today's Earnings Crown Hero Cell ──
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: isDark
                    ? const LinearGradient(
                        colors: [Color(0xFF1E1E26), Color(0xFF131317)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : const LinearGradient(
                        colors: [AppTheme.porcelainSurface, AppTheme.porcelainSurfaceContainer],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.porcelainOutline, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? const Color(0x22000000) : Colors.black.withValues(alpha: 0.05),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Today's Earnings",
                        style: AppTheme.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                          letterSpacing: 1.1,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.successGreen.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.trending_up_rounded, color: AppTheme.successGreen, size: 12),
                            const SizedBox(width: 4),
                            Text(
                              '+18% vs avg',
                              style: AppTheme.inter(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.successGreen,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'KES 1,890.50',
                    style: AppTheme.montserrat(
                      fontSize: 32,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Stat chips in summary banner
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF17171D) : AppTheme.porcelainSurface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isDark ? Colors.white10 : AppTheme.porcelainOutline),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatChip('Trips', '12', isDark),
                        Container(width: 1, height: 24, color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                        _buildStatChip('Hours', '6.5', isDark),
                        Container(width: 1, height: 24, color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
                        _buildStatChip('This Week', 'KES 9,240', isDark),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // ── Stitch Ergonomic 2x2 Telemetry Grid ──
            Row(
              children: [
                Expanded(
                  child: _buildMetricTile(
                    title: 'Gross Billed',
                    value: '6,050/-',
                    subtext: '14 Full Dispatches',
                    icon: Icons.receipt_long_rounded,
                    accentColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                    isDark: isDark,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricTile(
                    title: 'Total Distance',
                    value: '118.4 km',
                    subtext: 'Nairobi Metro (11 Routes)',
                    icon: Icons.route_rounded,
                    accentColor: isDark ? Colors.white70 : AppTheme.porcelainTextPrimary,
                    isDark: isDark,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildMetricTile(
                    title: 'Hourly Yield',
                    value: '567/- /hr',
                    subtext: 'Top Tier Efficiency',
                    icon: Icons.speed_rounded,
                    accentColor: AppTheme.successGreen,
                    isDark: isDark,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricTile(
                    title: 'Acceptance',
                    value: '78.5%',
                    subtext: 'SACCO VIP Benchmark',
                    icon: Icons.thumb_up_rounded,
                    accentColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                    isDark: isDark,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // ── Instant M-Pesa Settlement Strip ──
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle_rounded, color: AppTheme.successGreen, size: 18),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Credited instantly to M-Pesa Wallet',
                          style: AppTheme.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                          ),
                        ),
                        Text(
                          'Safcom Direct • Ref CP-99104-NAI',
                          style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Settled',
                      style: AppTheme.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.successGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Navigation Section: All 4 Navigation Cards ──
            Text(
              'EARNINGS MANAGEMENT',
              style: AppTheme.inter(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),

            _buildNavCard(
              context,
              title: 'My Earnings',
              subtitle: 'Comprehensive ledger & statements',
              icon: Icons.account_balance_wallet_rounded,
              isDark: isDark,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const MyEarningsScreen()),
              ),
            ),
            const SizedBox(height: 10),

            _buildNavCard(
              context,
              title: 'Trip History',
              subtitle: 'Detailed receipt breakdown per ride',
              icon: Icons.history_rounded,
              isDark: isDark,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const EarningsHistoryScreen()),
              ),
            ),
            const SizedBox(height: 10),

            _buildNavCard(
              context,
              title: 'Statements',
              subtitle: 'Weekly tax waybills & occurrence logs',
              icon: Icons.description_rounded,
              isDark: isDark,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const EarningsStatementsScreen()),
              ),
            ),
            const SizedBox(height: 10),

            _buildNavCard(
              context,
              title: 'Earnings Goal',
              subtitle: 'Set and track daily shift targets',
              icon: Icons.flag_rounded,
              isDark: isDark,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const EarningsGoalScreen()),
              ),
            ),
            const SizedBox(height: 20),

            // ── Boost Tip Banner ──
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: isDark
                    ? const LinearGradient(
                        colors: [Color(0xFF1E1A14), Color(0xFF14120E)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : const LinearGradient(
                        colors: [Color(0xFFFEF3C7), AppTheme.porcelainSurface],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.4)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: (isDark ? AppTheme.primaryColor : AppTheme.aurumBronze).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze.withValues(alpha: 0.4)),
                    ),
                    child: Icon(Icons.bolt_rounded, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Boost Your Earnings',
                          style: AppTheme.outfit(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Peak airport transfers in Westlands active between 17:00 - 20:00 (1.4x surge)',
                          style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white70 : AppTheme.porcelainTextSecondary),
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
      bottomSheet: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
          border: Border(top: BorderSide(color: isDark ? Colors.white12 : AppTheme.porcelainOutline)),
        ),
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton.icon(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Instant M-Pesa cashout initiated to registered phone')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
              foregroundColor: isDark ? Colors.black : Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 4,
            ),
            icon: Icon(Icons.flash_on_rounded, color: isDark ? Colors.black : Colors.white, size: 20),
            label: Text(
              'Instant M-Pesa Cashout',
              style: AppTheme.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: isDark ? Colors.black : Colors.white),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatChip(String label, String value, bool isDark) {
    return Column(
      children: [
        Text(
          value,
          style: AppTheme.montserrat(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: AppTheme.inter(
            fontSize: 11,
            color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricTile({
    required String title,
    required String value,
    required String subtext,
    required IconData icon,
    required Color accentColor,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white54 : AppTheme.porcelainTextSecondary)),
              Icon(icon, color: accentColor, size: 16),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTheme.montserrat(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: accentColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtext,
            style: AppTheme.inter(fontSize: 10, color: isDark ? Colors.white38 : AppTheme.porcelainTextSecondary.withValues(alpha: 0.8)),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildNavCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
    required bool isDark,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isDark ? Colors.white12 : AppTheme.porcelainOutline),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withValues(alpha: 0.06) : AppTheme.porcelainSurfaceContainer,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: isDark ? Colors.white10 : AppTheme.porcelainOutline),
              ),
              child: Icon(icon, color: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze, size: 20),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTheme.outfit(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, color: isDark ? Colors.white30 : AppTheme.porcelainTextSecondary, size: 14),
          ],
        ),
      ),
    );
  }
}

