import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:driver_app/screens/downline_screen.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:driver_app/theme/app_theme.dart';
import 'package:driver_app/services/referral_service.dart';
import 'package:driver_app/providers/auth_provider.dart';

enum ReferralStatus { pending, active }

class ReferredDriverDto {
  final String name;
  final ReferralStatus status;
  final DateTime joinedAt;

  ReferredDriverDto({
    required this.name,
    required this.status,
    required this.joinedAt,
  });
}

class DriverReferralInfoDto {
  final String referralCode;
  final List<ReferredDriverDto> referredDrivers;

  DriverReferralInfoDto({
    required this.referralCode,
    required this.referredDrivers,
  });
}

class ReferralProgramScreen extends ConsumerStatefulWidget {
  const ReferralProgramScreen({super.key});

  @override
  ConsumerState<ReferralProgramScreen> createState() =>
      _ReferralProgramScreenState();
}

class _ReferralProgramScreenState extends ConsumerState<ReferralProgramScreen> {
  final ReferralService _referralService = ReferralService();
  late Future<DriverReferralInfoDto> _referralInfoFuture;

  @override
  void initState() {
    super.initState();
    _referralInfoFuture = _fetchReferralInfo();
  }

  Future<DriverReferralInfoDto> _fetchReferralInfo() async {
    final authState = ref.read(authProvider);
    String? driverId;
    if (authState is Authenticated) {
      driverId = authState.userId;
    }

    if (driverId == null) {
      return DriverReferralInfoDto(
        referralCode: 'LOGIN-REQ',
        referredDrivers: [],
      );
    }

    try {
      final code = await _referralService.getReferralCode(driverId);
      final downline = await _referralService.getDownline(driverId);

      final List<ReferredDriverDto> referredDrivers = downline
          .map((item) => ReferredDriverDto(
                name: item['name'] ?? 'Unknown',
                status: item['status'] == 'ACTIVE'
                    ? ReferralStatus.active
                    : ReferralStatus.pending,
                joinedAt: item['joinedAt'] != null
                    ? DateTime.parse(item['joinedAt'])
                    : DateTime.now(),
              ))
          .toList();

      return DriverReferralInfoDto(
        referralCode: code,
        referredDrivers: referredDrivers,
      );
    } catch (e) {
      return DriverReferralInfoDto(
        referralCode: 'ERROR',
        referredDrivers: [],
      );
    }
  }

  void _shareDriverCode(String code) {
    final message =
        'Join Cabi Africa as a driver and earn more with 18% capped commissions! Use my referral code: $code\nSign up here: https://cabi.africa/d';
    Clipboard.setData(ClipboardData(text: message));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Driver invite message copied to clipboard!')),
    );
  }

  void _sharePassengerCode(String code) {
    final message =
        'Ride with Cabi Africa! Safe, reliable rides with in-cabin safety cameras and fair fares. Use my referral code $code for discounts on your rides: https://cabi.africa/p';
    Clipboard.setData(ClipboardData(text: message));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Commuter invite message copied to clipboard!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Invite & Earn')),
      body: FutureBuilder<DriverReferralInfoDto>(
        future: _referralInfoFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return const Center(child: Text('Could not load referral info.'));
          }

          final referralInfo = snapshot.data!;
          final inviteLink =
              "https://cabi.africa/invite?code=${referralInfo.referralCode}";

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16)),
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      children: [
                        Text(
                          'Scan to Join My Team',
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        QrImageView(
                          data: inviteLink,
                          version: QrVersions.auto,
                          size: 200.0,
                          backgroundColor: Colors.white,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          referralInfo.referralCode,
                          style: Theme.of(context)
                              .textTheme
                              .headlineMedium
                              ?.copyWith(
                                  color: AppTheme.primaryColor,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2.0),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Share this unique code or QR with fellow drivers and commuters.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                _buildProgramTermsNotice(context),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _shareDriverCode(referralInfo.referralCode),
                        icon: const Icon(Icons.drive_eta, size: 16),
                        label: const Text('Invite Driver', style: TextStyle(fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey[200],
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _sharePassengerCode(referralInfo.referralCode),
                        icon: const Icon(Icons.person_add_alt_1, size: 16),
                        label: const Text('Invite Rider', style: TextStyle(fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.amber.shade100,
                          foregroundColor: Colors.black,
                          side: BorderSide(color: Colors.amber.shade400),
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      tooltip: 'View Downline Team',
                      icon: const Icon(Icons.people, color: Colors.black),
                      style: IconButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        padding: const EdgeInsets.all(12),
                      ),
                      onPressed: () {
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) =>
                                    const DownlineScreen()));
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Recent Referrals',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ),
                if (referralInfo.referredDrivers.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text('No referrals yet.'),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: referralInfo.referredDrivers.length,
                    itemBuilder: (context, index) {
                      final driver = referralInfo.referredDrivers[index];
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: Colors.grey[200],
                          child: Text(
                              driver.name.isNotEmpty ? driver.name[0] : '?'),
                        ),
                        title: Text(driver.name),
                        subtitle:
                            Text('Status: ${driver.status.name.toUpperCase()}'),
                        trailing: Text(
                          driver.status == ReferralStatus.active
                              ? '+ Earned'
                              : 'Pending',
                          style: TextStyle(
                              color: driver.status == ReferralStatus.active
                                  ? Colors.green
                                  : Colors.orange,
                              fontWeight: FontWeight.bold),
                        ),
                      );
                    },
                  ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text('Opening Driver Portal...')),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      foregroundColor: const Color(0xFFFFBE0B),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text('View Full Team in Portal',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProgramTermsNotice(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.amber.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.verified_user, color: Colors.amber.shade800, size: 20),
              const SizedBox(width: 8),
              const Text(
                'Captain Referral Program Terms',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            '• Registration Incentive: Designed to reward recruiting new captains and commuters on registration (90-day attribution window).\n'
            '• Cross-Referral Scope: Captains can refer both fellow Drivers and Commuters/Passengers.\n'
            '• Fair Competition: Drivers may share personal referral links with commuters met in transit for future trips (no mid-trip cancellations).\n'
            '• 7-Day Clearance: Referral earnings undergo a 7-day (168h) escrow clearance before moving to available balance.\n'
            '• Weekly Payouts: Minimum withdrawal is KES 500, disbursed weekly via carrier-neutral Mobile Money or Bank.\n'
            '• Activation Deposit: Ksh 1,000 deposit is 100% credited to captain wallet for ride commissions (non-refundable as cash).',
            style: TextStyle(fontSize: 12, height: 1.45, color: Colors.black87),
          ),
          const SizedBox(height: 10),
          InkWell(
            onTap: () => _showCaptainReferralTermsSheet(context),
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Read Full Updated Referral Terms & Conditions',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.amber.shade900,
                      decoration: TextDecoration.underline,
                      decorationColor: Colors.amber.shade900,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.open_in_new_rounded,
                    size: 14,
                    color: Colors.amber.shade900,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showCaptainReferralTermsSheet(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1B1915) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1E1E1E);
    final subtextColor = isDark ? Colors.white70 : const Color(0xFF555555);
    final cardBg = isDark ? const Color(0xFF26221C) : const Color(0xFFFBF8F1);
    final borderColor = AppTheme.primaryColor.withValues(alpha: isDark ? 0.25 : 0.35);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.85,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          builder: (_, scrollController) {
            return Container(
              decoration: BoxDecoration(
                color: surfaceColor,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                border: Border.all(color: borderColor, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 25,
                    offset: const Offset(0, -6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  Container(
                    width: 44,
                    height: 5,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.gavel_rounded,
                            color: AppTheme.primaryColor,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Captain Referral Program Terms',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: textColor,
                                ),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'Updated November 2026 • Registration Incentive',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: AppTheme.primaryColor,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded),
                          color: subtextColor,
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Divider(color: borderColor, height: 1),
                  Expanded(
                    child: ListView(
                      controller: scrollController,
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                      children: [
                        _buildDriverTermsCard(
                          icon: Icons.campaign_rounded,
                          title: '1. Onboarding Registration Campaign',
                          body: 'The Captain Referral Program is structured as an onboarding incentive for registering new captains (active 90-day attribution window). It is not an indefinite or permanent annuity.',
                          cardBg: cardBg,
                          borderColor: borderColor,
                          textColor: textColor,
                          subtextColor: subtextColor,
                        ),
                        const SizedBox(height: 12),
                        _buildDriverTermsCard(
                          icon: Icons.people_outline_rounded,
                          title: '2. Driver & Commuter Referral Scope',
                          body: 'Captains are authorized to refer both fellow Captain Drivers and Commuters/Passengers. Drivers earn qualifying referral rewards when referred commuters register and complete trips on Cabi Africa.',
                          cardBg: cardBg,
                          borderColor: borderColor,
                          textColor: textColor,
                          subtextColor: subtextColor,
                        ),
                        const SizedBox(height: 12),
                        _buildDriverTermsCard(
                          icon: Icons.hourglass_top_rounded,
                          title: '3. 7-Day (168h) Dispute Clearance Escrow',
                          body: 'All referral dividends enter a 7-day (168-hour) dispute clearance holding period (PENDING_REVIEW) post-trip. Matures to available balance once trip verification and fair ride audits are completed.',
                          cardBg: cardBg,
                          borderColor: borderColor,
                          textColor: textColor,
                          subtextColor: subtextColor,
                        ),
                        const SizedBox(height: 12),
                        _buildDriverTermsCard(
                          icon: Icons.account_balance_wallet_rounded,
                          title: '4. Minimum KES 500 Weekly Disbursal',
                          body: 'The minimum balance to request a withdrawal is KES 500. Payout disbursements are settled weekly directly to your registered Mobile Money or Bank account.',
                          cardBg: cardBg,
                          borderColor: borderColor,
                          textColor: textColor,
                          subtextColor: subtextColor,
                        ),
                        const SizedBox(height: 12),
                        _buildDriverTermsCard(
                          icon: Icons.verified_user_rounded,
                          title: '5. Ksh 1,000 Captain Value-Back Deposit',
                          body: 'The Ksh 1,000 driver activation deposit is 100% credited into your captain platform wallet for trip commissions and platform service fees (non-refundable as cash).',
                          cardBg: cardBg,
                          borderColor: borderColor,
                          textColor: textColor,
                          subtextColor: subtextColor,
                        ),
                        const SizedBox(height: 12),
                        _buildDriverTermsCard(
                          icon: Icons.shield_rounded,
                          title: '6. Platform Funded & Anti-Collusion',
                          body: 'Referral dividends are funded 100% from the platform\'s commission margin without reducing driver fares. Automated collusion audits safeguard the integrity of the earnings pool.',
                          cardBg: cardBg,
                          borderColor: borderColor,
                          textColor: textColor,
                          subtextColor: subtextColor,
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryColor,
                              foregroundColor: const Color(0xFF1E1602),
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () => Navigator.pop(ctx),
                            child: const Text(
                              'I Understand & Agree',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildDriverTermsCard({
    required IconData icon,
    required String title,
    required String body,
    required Color cardBg,
    required Color borderColor,
    required Color textColor,
    required Color subtextColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor, width: 0.8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: AppTheme.primaryColor),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            body,
            style: TextStyle(
              fontSize: 11.5,
              height: 1.45,
              color: subtextColor,
            ),
          ),
        ],
      ),
    );
  }
}
