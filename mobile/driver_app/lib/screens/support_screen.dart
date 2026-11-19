import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import 'driver_dispute_appeal_screen.dart';
import 'lost_item_response_screen.dart';

class DriverSupportScreen extends StatelessWidget {
  const DriverSupportScreen({super.key});

  final bool isUnderOrganization = true;

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (!await launchUrl(launchUri)) {
      throw Exception('Could not launch $launchUri');
    }
  }

  Future<void> _sendEmail(String email) async {
    final Uri launchUri = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=Driver Support Request&body=Hi Driver Support Team,',
    );
    if (!await launchUrl(launchUri)) {
      throw Exception('Could not launch $launchUri');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppTheme.obsidianCanvas : AppTheme.porcelainCanvas;
    final surfaceColor = isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurface;
    final textColor = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final subtextColor = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;
    final accent = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Text(
          'CAPTAIN SUPPORT & WELFARE',
          style: GoogleFonts.inter(
            color: accent,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
            fontSize: 13,
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: accent),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          children: [
            // Header Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      color: accent.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.headset_mic_rounded, size: 28, color: accent),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    "Captain Dispatch Care",
                    style: GoogleFonts.inter(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    "24/7 dedicated assistance for road patrol, vehicle issues & SACCO queries.",
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      color: subtextColor,
                      fontSize: 12,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Organization Team Leader
            if (isUnderOrganization) ...[
              _buildSectionHeader("SACCO / FLEET PATROL", isDark, accent),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: surfaceColor,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.shield_outlined, color: Colors.green, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "2NK SACCO Fleet Manager",
                            style: GoogleFonts.inter(
                              fontWeight: FontWeight.w700,
                              fontSize: 13.5,
                              color: textColor,
                            ),
                          ),
                          Text(
                            "Direct route marshal & welfare desk",
                            style: GoogleFonts.inter(fontSize: 11, color: subtextColor),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.phone_in_talk_rounded, color: Colors.green),
                      onPressed: () => _makePhoneCall("+254711111111"),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // General Channels
            _buildSectionHeader("COMMUNICATION CHANNELS", isDark, accent),
            _buildContactOption(
              context,
              icon: Icons.phone_in_talk_rounded,
              title: "Toll-Free Dispatch Helpline",
              subtitle: "Immediate emergency & accident escalation",
              iconColor: Colors.green,
              isDark: isDark,
              textColor: textColor,
              subtextColor: subtextColor,
              onTap: () => _makePhoneCall("+254700000000"),
            ),
            _buildContactOption(
              context,
              icon: Icons.chat_bubble_outline_rounded,
              title: "Live Chat with Dispatch",
              subtitle: "Average response time: < 2 minutes",
              iconColor: Colors.blueAccent,
              isDark: isDark,
              textColor: textColor,
              subtextColor: subtextColor,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text("Connecting to real-time dispatch radio..."),
                    backgroundColor: Colors.blueAccent,
                  ),
                );
              },
            ),
            _buildContactOption(
              context,
              icon: Icons.alt_route_rounded,
              title: "Route Detour Appeals",
              subtitle: "Appeal flagged GPS detours within your 48-hr SLA",
              iconColor: const Color(0xFFFFB800),
              isDark: isDark,
              textColor: textColor,
              subtextColor: subtextColor,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (ctx) => DriverDisputeAppealScreen(
                      disputeId: 'disp_demo_982',
                      tripId: 'trip_nairobi_cbd_551',
                      detourPercent: 34.8,
                      claimedOvercharge: 420.0,
                      appealDeadline: DateTime.now().add(const Duration(hours: 42, minutes: 15)),
                    ),
                  ),
                );
              },
            ),
            _buildContactOption(
              context,
              icon: Icons.find_in_page_outlined,
              title: "Lost & Found Returns",
              subtitle: "Verify 4-digit handover PIN for courier fee payout",
              iconColor: const Color(0xFF00A859),
              isDark: isDark,
              textColor: textColor,
              subtextColor: subtextColor,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (ctx) => const LostItemResponseScreen(
                      rideId: 'trip_nairobi_cbd_551',
                      reportId: 'rep_lost_item_101',
                    ),
                  ),
                );
              },
            ),
            _buildContactOption(
              context,
              icon: Icons.mail_outline_rounded,
              title: "Driver Welfare & Disputes",
              subtitle: "welfare@cabi.africa • 24hr ticket SLA",
              iconColor: accent,
              isDark: isDark,
              textColor: textColor,
              subtextColor: subtextColor,
              onTap: () => _sendEmail("welfare@cabi.africa"),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark, Color accent) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 10.5,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
            color: accent,
          ),
        ),
      ),
    );
  }

  Widget _buildContactOption(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color iconColor,
    required bool isDark,
    required Color textColor,
    required Color subtextColor,
    required VoidCallback onTap,
  }) {
    final surfaceColor = isDark ? AppTheme.surfaceContainer : AppTheme.porcelainSurface;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppTheme.outlineBorder : AppTheme.porcelainOutline,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        onTap: onTap,
        leading: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        title: Text(
          title,
          style: GoogleFonts.inter(
            color: textColor,
            fontWeight: FontWeight.w700,
            fontSize: 13.5,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Text(
            subtitle,
            style: GoogleFonts.inter(
              color: subtextColor,
              fontSize: 11,
            ),
          ),
        ),
        trailing: Icon(
          Icons.chevron_right_rounded,
          color: subtextColor.withValues(alpha: 0.6),
          size: 20,
        ),
      ),
    );
  }
}
