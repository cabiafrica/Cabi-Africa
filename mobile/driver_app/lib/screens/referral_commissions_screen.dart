import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'downline_screen.dart';
import '../services/referral_service.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class ReferralCommissionsScreen extends ConsumerStatefulWidget {
  const ReferralCommissionsScreen({super.key});

  @override
  ConsumerState<ReferralCommissionsScreen> createState() =>
      _ReferralCommissionsScreenState();
}

class _ReferralCommissionsScreenState
    extends ConsumerState<ReferralCommissionsScreen> {
  bool _isLoading = true;
  double _totalEarned = 0.0;
  List<Map<String, dynamic>> _history = [];
  String _referralCode = '...';
  late final ReferralService _referralService;

  @override
  void initState() {
    super.initState();
    _referralService = ref.read(referralServiceProvider);
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);

    final authState = ref.read(authProvider);
    String? driverId;

    if (authState is Authenticated) {
      driverId = authState.userId;
    }

    if (driverId == null) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      final stats = await _referralService.getReferralStats(driverId);
      final code = await _referralService.getReferralCode(driverId);

      if (mounted) {
        setState(() {
          _referralCode = code;
          _totalEarned =
              double.tryParse(stats['totalEarned']?.toString() ?? '0.0') ?? 0.0;
          _history = (stats['history'] as List? ?? []).map((item) {
            return {
              'id': item['id'],
              'amount': double.tryParse(item['amount'].toString()) ?? 0.0,
              'date': DateTime.tryParse(item['date'] ?? '') ?? DateTime.now(),
              'description': item['description'] ?? 'Commission',
              'sourceDriverId': item['sourceDriverId'] ?? 'Unknown'
            };
          }).toList();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _shareCode() {
    Clipboard.setData(ClipboardData(text: _referralCode));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Referral code copied to clipboard!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('My Commissions'),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: _shareCode,
            tooltip: 'Share Code',
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: CustomScrollView(
                slivers: [
                  // Header Card
                  SliverToBoxAdapter(
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(30),
                          bottomRight: Radius.circular(30),
                        ),
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'UNSETTLED BALANCE',
                            style: TextStyle(
                              color: Colors.white54,
                              letterSpacing: 1.5,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'KES ${_totalEarned.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: AppTheme.primaryColor,
                              fontSize: 40,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _buildQuickStat(
                                'ACTIVE REFERRALS',
                                _history.length.toString(),
                                Icons.people,
                              ),
                              const SizedBox(width: 40),
                              _buildQuickStat(
                                'TOTAL REWARDED',
                                '${_history.length}',
                                Icons.card_giftcard,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Policy & Terms Notice
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(15),
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
                              '• Registration Incentive: Designed to reward recruiting new captains on registration (90-day attribution window). Not a continuous annuity.\n'
                              '• Driver Scope: Captains can refer fellow Captain Drivers only.\n'
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
                      ),
                    ),
                  ),

                  // Referral Code Section
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 30, 20, 10),
                      child: InkWell(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => const DownlineScreen()),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(15),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 10,
                                offset: const Offset(0, 5),
                              )
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor
                                      .withValues(alpha: 0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.account_tree,
                                    color: Colors.orange),
                              ),
                              const SizedBox(width: 15),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'View Downline Network',
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                    Text(
                                      'Explore your multi-level team',
                                      style: TextStyle(
                                          color: Colors.grey, fontSize: 12),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios,
                                  size: 14, color: Colors.grey),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Transactions Header
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(25, 20, 25, 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'COMMISSION HISTORY',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.grey,
                              letterSpacing: 1.2,
                            ),
                          ),
                          Text(
                            '${_history.length} entries',
                            style: const TextStyle(
                                fontSize: 12, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // History List
                  if (_history.isEmpty)
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.history,
                                size: 60, color: Colors.black12),
                            SizedBox(height: 10),
                            Text(
                              'No commissions recorded yet',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final item = _history[index];
                          final date = item['date'] as DateTime;
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 20, vertical: 5),
                            child: Card(
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                                side: BorderSide(color: Colors.grey.shade200),
                              ),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: Colors.green[50],
                                  child: const Icon(Icons.trending_up,
                                      color: Colors.green, size: 18),
                                ),
                                title: Text(
                                  item['description'],
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14),
                                ),
                                subtitle: Text(
                                  '${date.day}/${date.month}/${date.year} • Ref: ${item['sourceDriverId']}',
                                  style: const TextStyle(fontSize: 12),
                                ),
                                trailing: Text(
                                  '+KES ${item['amount'].toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                        childCount: _history.length,
                      ),
                    ),

                  const SliverPadding(padding: EdgeInsets.only(bottom: 30)),
                ],
              ),
            ),
    );
  }

  Widget _buildQuickStat(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white54, size: 20),
        const SizedBox(height: 5),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white38, fontSize: 10),
        ),
      ],
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
                          icon: Icons.badge_rounded,
                          title: '2. Captain-to-Captain Scope',
                          body: 'Captains are authorized to recruit and refer fellow Captain Drivers only. Passenger referral attribution is restricted by platform policy.',
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

