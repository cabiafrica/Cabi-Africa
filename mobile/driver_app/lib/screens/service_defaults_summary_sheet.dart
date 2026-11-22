import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:driver_app/config/app_config.dart';
import 'package:driver_app/providers/auth_provider.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/widgets/secure_webview.dart';

enum ServiceToolType {
  cabiLegacy,
  wallet,
  finance,
  driverGroup,
  welfare,
  vehicle,
  network,
}

class ServiceDefaultsSummarySheet extends ConsumerWidget {
  final ServiceToolType type;

  const ServiceDefaultsSummarySheet({super.key, required this.type});

  static void show(BuildContext context, ServiceToolType type) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ServiceDefaultsSummarySheet(type: type),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final authState = ref.watch(authProvider);
    final user = authState is Authenticated ? authState.user : null;
    final driverProfile = user?['driverProfile'] as Map<String, dynamic>?;

    final config = _getServiceConfig(type, user, driverProfile);

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.obsidianCanvas : AppTheme.porcelainCanvas,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border.all(
          color: isDark ? Colors.white12 : AppTheme.porcelainOutline,
          width: 1,
        ),
      ),
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? Colors.white24 : Colors.black12,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Header with Icon & Title
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: config.accentColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: config.accentColor.withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: Icon(config.icon, color: config.accentColor, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      config.title.toUpperCase(),
                      style: GoogleFonts.inter(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                        color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'CONFIGURED DEFAULTS SUMMARY',
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                        color: config.accentColor,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: Icon(
                  Icons.close_rounded,
                  color: isDark ? Colors.white54 : Colors.black54,
                  size: 20,
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Configured Defaults Content or Empty State
          if (config.hasActivePrograms) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? Colors.white.withValues(alpha: 0.04) : Colors.black.withValues(alpha: 0.03),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? Colors.white10 : Colors.black12,
                ),
              ),
              child: Column(
                children: config.details.map((d) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          d.label,
                          style: GoogleFonts.inter(
                            fontSize: 12.5,
                            color: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
                          ),
                        ),
                        Text(
                          d.value,
                          style: GoogleFonts.inter(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: isDark ? Colors.white : AppTheme.porcelainTextPrimary,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.amber.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.amber.withValues(alpha: 0.25)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline_rounded, color: Colors.amber, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'No active programs have been created by the administration yet. Check back once programs are published by your administrator.',
                      style: GoogleFonts.inter(
                        fontSize: 12.5,
                        color: isDark ? Colors.white70 : AppTheme.porcelainTextPrimary,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 18),

          // Security & Verification Notice
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF141414) : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDark ? Colors.white12 : Colors.black12,
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.lock_outline_rounded, size: 18, color: config.accentColor),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Settings and policy modifications must be performed on the Cabi User Portal and require user identity verification.',
                    style: GoogleFonts.inter(
                      fontSize: 11.5,
                      color: isDark ? Colors.white60 : Colors.black87,
                      height: 1.35,
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 22),

          // Action Button: Open In-App Secure Webview Sheet
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).pop();
                openSecurePortalSheet(
                  context,
                  url: config.portalUrl,
                  title: config.title,
                );
              },
              icon: const Icon(Icons.shield_rounded, size: 18, color: Colors.black),
              label: Text(
                'VERIFY & CONFIGURE ON USER PORTAL',
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                  color: Colors.black,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  _ServiceConfig _getServiceConfig(
    ServiceToolType type,
    Map<String, dynamic>? user,
    Map<String, dynamic>? driverProfile,
  ) {
    final basePortalUrl = AppConfig.userPortalUrl;

    switch (type) {
      case ServiceToolType.cabiLegacy:
        final saccoEnrolled = driverProfile?['saccoEnrolled'] == true;
        return _ServiceConfig(
          title: 'Cabi Legacy & Wealth',
          icon: Icons.auto_awesome_rounded,
          accentColor: AppTheme.primaryColor,
          portalUrl: '$basePortalUrl/drivers/sacco/manage',
          hasActivePrograms: saccoEnrolled,
          details: [
            _Detail('Enrollment Status', saccoEnrolled ? 'Active Partner' : 'Not Enrolled'),
            _Detail('Default Contribution', '5.0% per trip'),
            _Detail('Cabi Match Bonus', '3.0% (Platform Incentive)'),
            _Detail('Remittance Frequency', 'Daily Fare Remittance'),
          ],
        );

      case ServiceToolType.wallet:
        return _ServiceConfig(
          title: 'Wallet & Payouts',
          icon: Icons.account_balance_wallet_outlined,
          accentColor: Colors.indigoAccent,
          portalUrl: '$basePortalUrl/portal/wallet',
          hasActivePrograms: true,
          details: [
            _Detail('Payout Target', user?['phone'] ?? '+254 Standard M-Pesa'),
            _Detail('Settlement Schedule', 'Daily Automatic (23:59 EAT)'),
            _Detail('Commission Tier', 'Standard 15% Platform'),
            _Detail('Security Hold', 'KES 0.00'),
          ],
        );

      case ServiceToolType.finance:
        return _ServiceConfig(
          title: 'Finance & Advances',
          icon: Icons.account_balance_rounded,
          accentColor: Colors.orangeAccent,
          portalUrl: '$basePortalUrl/drivers/sacco/manage',
          hasActivePrograms: false, // Programs created by admin; default empty
          details: [
            _Detail('Asset Financing', 'No Active Contract'),
            _Detail('Emergency Fuel Advance', 'Configured by Admin'),
            _Detail('Underwriting Status', 'Pending Verification'),
          ],
        );

      case ServiceToolType.driverGroup:
        final groupName = driverProfile?['sacco'] ?? driverProfile?['driverGroup']?['name'] ?? 'Nairobi Central Fleet';
        return _ServiceConfig(
          title: 'Driver Group & Chapter',
          icon: Icons.groups_rounded,
          accentColor: Colors.amber,
          portalUrl: '$basePortalUrl/portal/groups',
          hasActivePrograms: true,
          details: [
            _Detail('Affiliated Chapter', groupName.toString()),
            _Detail('Regional Depot', 'Nairobi Metropolitan'),
            _Detail('Marshal Contact', 'Available via Dispatch'),
          ],
        );

      case ServiceToolType.welfare:
        return _ServiceConfig(
          title: 'Welfare & Safety Net',
          icon: Icons.shield_outlined,
          accentColor: Colors.cyan,
          portalUrl: '$basePortalUrl/portal/welfare',
          hasActivePrograms: false, // Programs created by admin; default empty
          details: [
            _Detail('Benevolent Protection', 'Medical & Breakdown Pool'),
            _Detail('Daily Contribution', 'KES 50.00 / Active Day'),
            _Detail('Verification Status', 'Identity Verified Only'),
          ],
        );

      case ServiceToolType.vehicle:
        final vehicle = driverProfile?['vehicle'] as Map<String, dynamic>?;
        final plate = vehicle?['plate'] ?? vehicle?['plateNumber'] ?? 'No Vehicle Bound';
        final model = vehicle?['model'] ?? 'Unassigned';
        return _ServiceConfig(
          title: 'Registered Vehicle Profile',
          icon: Icons.directions_car_filled_outlined,
          accentColor: Colors.blueGrey,
          portalUrl: '$basePortalUrl/portal/vehicles',
          hasActivePrograms: plate != 'No Vehicle Bound',
          details: [
            _Detail('Vehicle Model', model.toString()),
            _Detail('Registration Plate', plate.toString()),
            _Detail('Inspection Status', 'NTSA Verified'),
          ],
        );

      case ServiceToolType.network:
        final referralCode = user?['referralCode'] ?? 'CABI-PARTNER';
        return _ServiceConfig(
          title: 'Captain Referral Network',
          icon: Icons.share_rounded,
          accentColor: Colors.pinkAccent,
          portalUrl: '$basePortalUrl/portal/referrals',
          hasActivePrograms: true,
          details: [
            _Detail('Captain Code', referralCode.toString()),
            _Detail('Direct Commission', '5.0% on Referred Driver Fares'),
            _Detail('Secondary Downline', '2.0% Tier 2 Remittance'),
          ],
        );
    }
  }
}

class _Detail {
  final String label;
  final String value;
  _Detail(this.label, this.value);
}

class _ServiceConfig {
  final String title;
  final IconData icon;
  final Color accentColor;
  final String portalUrl;
  final bool hasActivePrograms;
  final List<_Detail> details;

  _ServiceConfig({
    required this.title,
    required this.icon,
    required this.accentColor,
    required this.portalUrl,
    required this.hasActivePrograms,
    required this.details,
  });
}
