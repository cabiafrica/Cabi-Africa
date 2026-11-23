import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme/app_theme.dart';
import 'report_lost_item_screen.dart';
import 'support_chat_screen.dart';

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
      query: 'subject=VIP Captain Concierge Inquiry&body=Hi Concierge Team,',
    );
    if (!await launchUrl(launchUri)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch email client for $email')),
        );
      }
    }
  }

  Future<void> _openWhatsApp(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final Uri launchUri = Uri.parse('https://wa.me/$cleanPhone');
    if (!await launchUrl(launchUri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not open WhatsApp for $phone')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final gold = isDark ? AppTheme.primaryColor : AppTheme.aurumBronze;
    final canvasColor = isDark ? const Color(0xFF0D0D0E) : AppTheme.porcelainCanvas;
    final appBarColor = isDark ? const Color(0xFF121215) : AppTheme.porcelainSurface;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;
    final sectionLabelColor = isDark ? Colors.white54 : AppTheme.porcelainTextSecondary;

    return Scaffold(
      backgroundColor: canvasColor,
      appBar: AppBar(
        backgroundColor: appBarColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'VIP Concierge & Support',
          style: AppTheme.outfit(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.successGreen.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.4)),
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
                gradient: isDark
                    ? const LinearGradient(
                        colors: [Color(0xFF1A1A22), Color(0xFF121216)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : LinearGradient(
                        colors: [AppTheme.porcelainSurfaceContainer, AppTheme.porcelainSurface],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.aurumBronze),
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
                      Icon(Icons.stars_rounded, color: gold, size: 22),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Executive Mobility Concierge',
                    style: AppTheme.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Dedicated Sacco-backed support for prompt recoveries, dispatch coordination, and executive inquiries.',
                    style: AppTheme.inter(
                      fontSize: 13,
                      color: textSecondary,
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
                color: gold,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),

            _buildLostFoundCard(isDark: isDark, gold: gold, textPrimary: textPrimary, textSecondary: textSecondary),
            const SizedBox(height: 24),

            // Section: Direct Contact Options
            Text(
              'DIRECT ESCALATION CHANNELS',
              style: AppTheme.inter(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: sectionLabelColor,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),

            _buildContactCard(
              isDark: isDark,
              gold: gold,
              icon: Icons.chat_bubble_outline_rounded,
              title: '24/7 Live Support Chat',
              subtitle: 'Message directly with our active concierge & dispatch desk',
              badge: 'LIVE CHAT',
              badgeColor: AppTheme.successGreen,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const SupportChatScreen()),
                );
              },
            ),
            const SizedBox(height: 10),

            _buildContactCard(
              isDark: isDark,
              gold: gold,
              icon: Icons.phone_in_talk_rounded,
              title: 'Cabi Customer Hotline',
              subtitle: 'Speak directly with senior dispatch (0758 777 222)',
              badge: '24/7',
              badgeColor: gold,
              onTap: () => _makePhoneCall('+254758777222'),
            ),
            const SizedBox(height: 10),

            _buildContactCard(
              isDark: isDark,
              gold: gold,
              icon: Icons.chat_bubble_rounded,
              title: 'Official WhatsApp Concierge',
              subtitle: '+254 758 777 222 • Instant VIP Support Desk',
              badge: 'WHATSAPP',
              badgeColor: const Color(0xFF25D366),
              onTap: () => _openWhatsApp('+254758777222'),
            ),
            const SizedBox(height: 10),

            _buildContactCard(
              isDark: isDark,
              gold: gold,
              icon: Icons.email_outlined,
              title: 'Customer Support Email',
              subtitle: 'cabifastafrica@gmail.com • 24/7 support desk',
              badge: 'OFFICIAL',
              badgeColor: isDark ? Colors.white60 : AppTheme.porcelainTextSecondary,
              onTap: () => _sendEmail('cabifastafrica@gmail.com'),
            ),
            const SizedBox(height: 10),

            _buildContactCard(
              isDark: isDark,
              gold: gold,
              icon: Icons.shield_rounded,
              title: 'Sacco Safety & Compliance',
              subtitle: 'Independent occurrence book log & vehicle audit',
              badge: 'AUDITED',
              badgeColor: AppTheme.successGreen,
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Connected to Sacco Safety & Compliance desk')),
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
                color: sectionLabelColor,
                letterSpacing: 1.1,
              ),
            ),
            const SizedBox(height: 12),

            _buildFaqTile(
              isDark: isDark,
              gold: gold,
              textPrimary: textPrimary,
              question: 'How do M-Pesa automatic receipts work?',
              answer: 'Every trip fare is itemized and immediately matched against Safaricom M-Pesa STK push. Official tax-compliant waybills are downloadable under Trip Receipt Details.',
            ),
            _buildFaqTile(
              isDark: isDark,
              gold: gold,
              textPrimary: textPrimary,
              question: 'What is the Cabi Guaranteed Lock?',
              answer: 'When scheduling rides 2+ hours ahead, your vehicle tier and fare are guaranteed. No surge pricing is ever applied to pre-reserved executive trips.',
            ),
            _buildFaqTile(
              isDark: isDark,
              gold: gold,
              textPrimary: textPrimary,
              question: 'How are Cabi Captains vetted?',
              answer: 'All drivers undergo formal Sacco accreditation, biometric verification, comprehensive background checks, and advanced defensive driving certification.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLostFoundCard({
    required bool isDark,
    required Color gold,
    required Color textPrimary,
    required Color textSecondary,
  }) {
    final cardColor = isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface;
    final cardBorder = isDark ? Colors.white12 : AppTheme.porcelainOutline;
    final iconBg = isDark ? AppTheme.primaryColor.withValues(alpha: 0.12) : gold.withValues(alpha: 0.1);
    final iconBorder = isDark ? AppTheme.outlineGold : AppTheme.aurumBronze;
    final btnBg = isDark ? const Color(0xFF1E1E26) : AppTheme.porcelainSurfaceContainer;
    final btnBorder = isDark ? AppTheme.outlineGold : AppTheme.aurumBronze;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardBorder),
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
                  color: iconBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: iconBorder),
                ),
                child: Icon(Icons.find_in_page_rounded, color: gold, size: 24),
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
                        color: textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Immediate alert sent to driver occurrence book',
                      style: AppTheme.inter(fontSize: 12, color: textSecondary),
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
                      driverId: 'CAPTAIN-01',
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: btnBg,
                foregroundColor: gold,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(color: btnBorder),
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
    );
  }

  Widget _buildContactCard({
    required bool isDark,
    required Color gold,
    required IconData icon,
    required String title,
    required String subtitle,
    required String badge,
    required Color badgeColor,
    required VoidCallback onTap,
  }) {
    final cardColor = isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface;
    final cardBorder = isDark ? Colors.white12 : AppTheme.porcelainOutline;
    final iconBg = isDark ? Colors.white.withValues(alpha: 0.06) : AppTheme.porcelainSurfaceContainer;
    final iconBorderColor = isDark ? Colors.white10 : AppTheme.porcelainOutline;
    final textPrimary = isDark ? Colors.white : AppTheme.porcelainTextPrimary;
    final textSecondary = isDark ? Colors.white60 : AppTheme.porcelainTextSecondary;
    final arrowColor = isDark ? Colors.white30 : AppTheme.porcelainTextSecondary;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: cardBorder),
        ),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: iconBorderColor),
              ),
              child: Icon(icon, color: gold, size: 22),
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
                            color: textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: badgeColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: badgeColor.withValues(alpha: 0.4)),
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
                    style: AppTheme.inter(fontSize: 12, color: textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios_rounded, color: arrowColor, size: 14),
          ],
        ),
      ),
    );
  }

  Widget _buildFaqTile({
    required bool isDark,
    required Color gold,
    required Color textPrimary,
    required String question,
    required String answer,
  }) {
    final cardColor = isDark ? const Color(0xFF141418) : AppTheme.porcelainSurface;
    final cardBorder = isDark ? Colors.white10 : AppTheme.porcelainOutline;
    final answerColor = isDark ? Colors.white70 : AppTheme.porcelainTextSecondary;
    final collapsedIconColor = isDark ? Colors.white38 : AppTheme.porcelainTextSecondary;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: cardBorder),
      ),
      child: Theme(
        data: ThemeData(dividerColor: Colors.transparent),
        child: ExpansionTile(
          iconColor: gold,
          collapsedIconColor: collapsedIconColor,
          title: Text(
            question,
            style: AppTheme.outfit(fontSize: 14, fontWeight: FontWeight.w600, color: textPrimary),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                answer,
                style: AppTheme.inter(fontSize: 12, color: answerColor, height: 1.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
