import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../config/app_config.dart';
import '../widgets/secure_webview.dart';
import '../widgets/sos_button.dart';
import 'wealth_creation_screen.dart';

class FinanceScreen extends StatefulWidget {
  const FinanceScreen({super.key});

  @override
  State<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends State<FinanceScreen> {
  // Financial Services Data
  final List<Map<String, dynamic>> _services = [
    {
      'id': 'sacco_shares',
      'title': 'Sacco Capital Savings & Shares',
      'category': 'COOPERATIVE BANKING',
      'partner': 'Stima DT Sacco / Boda PSV Sacco',
      'isSubscribed': false,
      'statsLabel': 'Accumulated Shares',
      'statsValue': 'KES 0.00',
      'detail': 'Daily remittance of KES 100 auto-deducted from ride earnings. Earns 11.2% annual dividend.',
      'icon': Icons.account_balance_rounded,
      'accentColor': const Color(0xFFFFB300),
      'portalPath': '/drivers/sacco/manage',
    },
    {
      'id': 'welfare_fund',
      'title': 'Driver Emergency & Benevolent Welfare',
      'category': 'SAFETY NET & RELIEF',
      'partner': 'Cabi Driver Community Welfare',
      'isSubscribed': false,
      'statsLabel': 'Welfare Pool',
      'statsValue': 'KES 0.00',
      'detail': 'Covers emergency hospitalization, roadside towing, and benevolent family support.',
      'icon': Icons.shield_rounded,
      'accentColor': const Color(0xFF00E5FF),
      'portalPath': '/drivers/sacco/manage',
    },
    {
      'id': 'fuel_advance',
      'title': 'Daily Fuel & Maintenance Advances',
      'category': 'WORKING CAPITAL',
      'partner': 'TotalEnergies & Shell Fuel Pass',
      'isSubscribed': false,
      'statsLabel': 'Available Advance',
      'statsValue': 'KES 0.00',
      'detail': 'Instant micro-liquidity for daily petrol, oil service, and quick vehicle maintenance.',
      'icon': Icons.local_gas_station_rounded,
      'accentColor': const Color(0xFF00E676),
      'portalPath': '/drivers/sacco/manage',
    },
    {
      'id': 'asset_financing',
      'title': 'Vehicle Asset Financing & Refinancing',
      'category': 'ASSET ACQUISITION',
      'partner': 'Harambee Sacco & Equity Bank',
      'isSubscribed': false,
      'statsLabel': 'Financing Limit',
      'statsValue': 'Up to KES 1,200,000',
      'detail': 'Lease-to-own financing for hybrid/EV vehicles with flexible daily fare remittances.',
      'icon': Icons.directions_car_filled_rounded,
      'accentColor': const Color(0xFFFF9100),
      'portalPath': '/drivers/sacco/manage',
    },
    {
      'id': 'psv_insurance',
      'title': 'PSV Comprehensive & Health Insurance',
      'category': 'INSURANCE SCHEME',
      'partner': 'Jubilee / CIC General Insurance',
      'isSubscribed': false,
      'statsLabel': 'Annual Coverage',
      'statsValue': 'KES 500,000 Underwriting',
      'detail': 'Driver and passenger accident cover, outpatient clinic card, and inpatient medical package.',
      'icon': Icons.health_and_safety_rounded,
      'accentColor': const Color(0xFF7C4DFF),
      'portalPath': '/drivers/sacco/manage',
    },
  ];

  void _openPortal(BuildContext context, {String path = '/drivers/sacco/manage'}) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => Stack(
          children: [
            SecureWebView(
              title: 'Driver Financial Portal',
              url: '${AppConfig.userPortalUrl}$path',
            ),
            Positioned(
              top: MediaQuery.of(context).padding.top + 70,
              right: 16,
              child: const SosButton(size: 46),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final activeCount = _services.where((s) => s['isSubscribed'] == true).length;
    final inactiveCount = _services.length - activeCount;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F0E0D) : const Color(0xFFF7F7F7),
      appBar: AppBar(
        title: Text(
          'FINANCIAL SERVICES',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            fontSize: 15,
            color: AppTheme.primaryColor,
          ),
        ),
        backgroundColor: isDark ? const Color(0xFF141311) : Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppTheme.primaryColor),
        actions: [
          IconButton(
            icon: const Icon(Icons.open_in_browser_rounded, color: AppTheme.primaryColor),
            tooltip: 'Open User Portal',
            onPressed: () => _openPortal(context),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Financial Overview Hero Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF1F1B14), Color(0xFF2A2318), Color(0xFF161512)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(
                      color: AppTheme.primaryColor.withValues(alpha: 0.4),
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withValues(alpha: 0.12),
                        blurRadius: 18,
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
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              gradient: AppTheme.goldGradient,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.account_balance_wallet_rounded, size: 13, color: Colors.black),
                                const SizedBox(width: 4),
                                Text(
                                  'FINANCIAL PORTFOLIO',
                                  style: GoogleFonts.inter(
                                    color: Colors.black,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 10.5,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '$activeCount Active • $inactiveCount Available',
                            style: GoogleFonts.inter(
                              color: AppTheme.primaryLight,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Total Cooperative Savings',
                        style: GoogleFonts.inter(
                          color: Colors.white70,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'KES 0.00',
                        style: GoogleFonts.inter(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          _buildPortfolioStat('Shares', 'KES 0', Colors.amber),
                          const SizedBox(width: 12),
                          _buildPortfolioStat('Welfare', 'KES 0', Colors.cyanAccent),
                          const SizedBox(width: 12),
                          _buildPortfolioStat('Advance Limit', 'KES 0', Colors.greenAccent),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Interactive Cabi Legacy Programs Banner
                InkWell(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const WealthCreationScreen()),
                  ),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF262013), Color(0xFF1B1812)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.6), width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.1),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.auto_awesome_rounded, color: AppTheme.primaryColor, size: 24),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    'CABI LEGACY',
                                    style: GoogleFonts.inter(
                                      color: AppTheme.primaryColor,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 11,
                                      letterSpacing: 1.0,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.amber.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      'MAX 30%',
                                      style: GoogleFonts.inter(
                                        color: Colors.amber,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 9,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Text(
                                'Build your legacy: Sacco, Pension & MMF',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                ),
                              ),
                              Text(
                                'Automated allocations from 80% net payouts',
                                style: GoogleFonts.inter(
                                  color: AppTheme.darkTextSecondary,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, color: AppTheme.primaryColor, size: 16),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Section Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'AVAILABLE SERVICES',
                      style: GoogleFonts.inter(
                        color: isDark ? Colors.white : Colors.black87,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'Tap to configure',
                      style: GoogleFonts.inter(
                        color: Colors.grey,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // List of Financial Services
                ..._services.map((svc) => _buildServiceCard(context, svc, isDark)),
              ],
            ),
          ),

          // Bottom Action Bar to open User Portal
          Positioned(
            left: 16,
            right: 16,
            bottom: 16,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.5),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: ElevatedButton.icon(
                onPressed: () => _openPortal(context),
                icon: const Icon(Icons.tune_rounded, size: 20),
                label: Text(
                  'OPEN USER PORTAL TO CONFIGURE',
                  style: GoogleFonts.inter(
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.0,
                    fontSize: 13,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 6,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPortfolioStat(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.25), width: 0.8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.inter(color: Colors.white60, fontSize: 10),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: GoogleFonts.inter(
                color: color,
                fontWeight: FontWeight.bold,
                fontSize: 11.5,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceCard(BuildContext context, Map<String, dynamic> svc, bool isDark) {
    final bool isSubscribed = svc['isSubscribed'] == true;
    final Color accentColor = svc['accentColor'] as Color;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF181715) : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isSubscribed
              ? accentColor.withValues(alpha: 0.4)
              : (isDark ? Colors.white10 : Colors.black12),
          width: isSubscribed ? 1.2 : 0.8,
        ),
        boxShadow: [
          BoxShadow(
            color: isSubscribed
                ? accentColor.withValues(alpha: 0.08)
                : Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: () => _openPortal(context, path: svc['portalPath']),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top row: Icon, Title & Active/Inactive Badge
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: accentColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: accentColor.withValues(alpha: 0.3)),
                      ),
                      child: Icon(svc['icon'] as IconData, color: accentColor, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            svc['category'] as String,
                            style: GoogleFonts.inter(
                              color: accentColor,
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            svc['title'] as String,
                            style: GoogleFonts.inter(
                              color: isDark ? Colors.white : Colors.black87,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            svc['partner'] as String,
                            style: GoogleFonts.inter(
                              color: Colors.grey,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Active / Inactive Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isSubscribed
                            ? const Color(0xFF00E676).withValues(alpha: 0.15)
                            : Colors.grey.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSubscribed
                              ? const Color(0xFF00E676).withValues(alpha: 0.5)
                              : Colors.grey.withValues(alpha: 0.3),
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isSubscribed ? Icons.check_circle_rounded : Icons.radio_button_unchecked,
                            size: 11,
                            color: isSubscribed ? const Color(0xFF00E676) : Colors.grey,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isSubscribed ? 'ACTIVE' : 'INACTIVE',
                            style: GoogleFonts.inter(
                              color: isSubscribed ? const Color(0xFF00E676) : Colors.grey,
                              fontWeight: FontWeight.bold,
                              fontSize: 9.5,
                              letterSpacing: 0.6,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Detail Description
                Text(
                  svc['detail'] as String,
                  style: GoogleFonts.inter(
                    color: isDark ? Colors.white70 : Colors.black87,
                    fontSize: 11.5,
                    height: 1.35,
                  ),
                ),

                const SizedBox(height: 12),

                // Stats & Action Row
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF12110F) : Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            svc['statsLabel'] as String,
                            style: GoogleFonts.inter(color: Colors.grey, fontSize: 10),
                          ),
                          Text(
                            svc['statsValue'] as String,
                            style: GoogleFonts.inter(
                              color: isSubscribed ? accentColor : (isDark ? Colors.white70 : Colors.black87),
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                            isSubscribed ? 'Configure' : 'Apply',
                            style: GoogleFonts.inter(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 11.5,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.chevron_right_rounded,
                            size: 16,
                            color: AppTheme.primaryColor,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
