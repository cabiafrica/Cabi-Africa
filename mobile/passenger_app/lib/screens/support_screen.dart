import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import 'report_lost_item_screen.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: phoneNumber,
    );
    if (!await launchUrl(launchUri)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch dialer for $phoneNumber')),
        );
      }
    }
  }

  Future<void> _sendEmail(String email) async {
    final Uri launchUri = Uri(
      scheme: 'mailto',
      path: email,
      query: 'subject=VIP Chauffeur Concierge Inquiry&body=Hi Concierge Team,',
    );
    if (!await launchUrl(launchUri)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch email client for $email')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0E),
      appBar: AppBar(
        backgroundColor: const Color(0xFF121215),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'VIP Concierge & Support',
          style: AppTheme.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.successGreen.withOpacity(0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.successGreen.withOpacity(0.4)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppTheme.successGreen,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  '24/7 Live',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.successGreen,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Executive Concierge Banner
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1A1A22), Color(0xFF121216)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.outlineGold),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x18000000),
                    blurRadius: 14,
                    offset: Offset(0, 4),
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
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'WHITE-GLOVE SERVICE',
                          style: AppTheme.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                            color: Colors.black,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                      const Icon(Icons.stars_rounded, color: AppTheme.primaryColor, size: 22),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Executive Mobility Concierge',
                    style: AppTheme.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Dedicated SACCO-backed support for prompt recoveries, dispatch coordination, and executive inquiries.',
                    style: AppTheme.inter(
                      fontSize: 13,
                      color: Colors.white60,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section: Lost & Found Concierge
            Text(
              'LOST & FOUND CONCIERGE',
              style: AppTheme.inter(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: AppTheme.primaryColor,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF141418),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.outlineGold),
                        ),
                        child: const Icon(Icons.find_in_page_rounded, color: AppTheme.primaryColor, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Left an item in a vehicle?',
                              style: AppTheme.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Immediate alert sent to driver occurrence book',
                              style: AppTheme.inter(fontSize: 12, color: Colors.white60),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const ReportLostItemScreen(
                              rideId: 'TRIP-LATEST',
                              driverId: 'CHAUFFEUR-01',
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E1E26),
                        foregroundColor: AppTheme.primaryColor,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: AppTheme.outlineGold),
                        ),
                      ),
                      icon: const Icon(Icons.report_problem_rounded, size: 18),
                      label: Text(
                        'FILE RECOVERY REPORT',
                        style: AppTheme.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Section: Direct Contact Options
            Text(
              'DIRECT ESCALATION CHANNELS',
              style: AppTheme.inter(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: Colors.white54,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),

            _buildContactCard(
              icon: Icons.phone_in_talk_rounded,
              title: 'Chauffeur VIP Hotline',
              subtitle: 'Speak directly with senior dispatch (+254 700 000 000)',
              badge: 'PRIORITY',
              badgeColor: AppTheme.primaryColor,
              onTap: () => _makePhoneCall('+254700000000'),
            ),
            const SizedBox(height: 10),

            _buildContactCard(
              icon: Icons.email_outlined,
              title: 'Executive Desk Email',
              subtitle: 'concierge@cabi.africa • 15 min response time',
              badge: 'OFFICIAL',
              badgeColor: Colors.white60,
              onTap: () => _sendEmail('concierge@cabi.africa'),
            ),
            const SizedBox(height: 10),

            _buildContactCard(
              icon: Icons.shield_rounded,
              title: 'SACCO Safety & Compliance',
              subtitle: 'Independent occurrence book log & vehicle audit',
              badge: 'AUDITED',
              badgeColor: AppTheme.successGreen,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Connected to SACCO Safety & Compliance desk')),
                );
              },
            ),
            const SizedBox(height: 24),

            // Frequently Asked Inquiries
            Text(
              'FREQUENT INQUIRIES',
              style: AppTheme.inter(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: Colors.white54,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),

            _buildFaqTile(
              question: 'How do M-Pesa automatic receipts work?',
              answer: 'Every trip fare is itemized and immediately matched against Safaricom M-Pesa STK push. Official tax-compliant waybills are downloadable under Trip Receipt Details.',
            ),
            _buildFaqTile(
              question: 'What is the Cabi Guaranteed Lock?',
              answer: 'When scheduling rides 2+ hours ahead, your vehicle tier and fare are guaranteed. No surge pricing is ever applied to pre-reserved executive trips.',
            ),
            _buildFaqTile(
              question: 'How are Cabi Chauffeurs vetted?',
              answer: 'All drivers undergo formal SACCO accreditation, biometric verification, comprehensive background checks, and advanced defensive driving certification.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required String badge,
    required Color badgeColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF141418),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white10),
              ),
              child: Icon(icon, color: AppTheme.primaryColor, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          title,
                          style: AppTheme.outfit(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: badgeColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: badgeColor.withOpacity(0.4)),
                        ),
                        child: Text(
                          badge,
                          style: AppTheme.inter(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: badgeColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: AppTheme.inter(fontSize: 12, color: Colors.white60),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white30, size: 14),
          ],
        ),
      ),
    );
  }

  Widget _buildFaqTile({required String question, required String answer}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF141418),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white10),
      ),
      child: Theme(
        data: ThemeData(dividerColor: Colors.transparent),
        child: ExpansionTile(
          iconColor: AppTheme.primaryColor,
          collapsedIconColor: Colors.white38,
          title: Text(
            question,
            style: AppTheme.outfit(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                answer,
                style: AppTheme.inter(fontSize: 12, color: Colors.white70, height: 1.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
