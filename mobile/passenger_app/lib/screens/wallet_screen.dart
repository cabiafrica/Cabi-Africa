import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/providers.dart';
import 'payout_setup_screen.dart';
import 'referral_screen.dart';
import '../services/referral_service.dart';
import '../providers/auth_provider.dart';
import 'package:passenger_app/theme/app_theme.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  late Future<Map<String, dynamic>> _walletFuture;
  double _referralEarned = 0.0;
  bool _isLoadingReferral = true;
  final PassengerReferralService _referralService = PassengerReferralService();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  void _fetchData() {
    _walletFuture = ref.read(rideServiceProvider).getWalletDetails();
    _fetchReferralCredits();
  }

  Future<void> _fetchReferralCredits() async {
    final authState = ref.read(passengerAuthProvider);
    String? userId;
    if (authState is Authenticated) {
      userId = authState.userId;
    }

    if (userId == null) {
      setState(() => _isLoadingReferral = false);
      return;
    }

    try {
      final data = await _referralService.getReferralHistory(userId);
      if (mounted) {
        setState(() {
          _referralEarned =
              double.tryParse(data['totalEarned']?.toString() ?? '0.0') ?? 0.0;
          _isLoadingReferral = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingReferral = false);
      }
    }
  }

  Future<void> _showCashOutDialog(double balance) async {
    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirm Payout'),
          content: Text(
            'Are you sure you want to cash out KES ${balance.toStringAsFixed(2)}?',
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('Cancel'),
              onPressed: () => Navigator.of(context).pop(),
            ),
            TextButton(
              child: const Text('Confirm'),
              onPressed: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Payout initiated!')),
                );
              },
            ),
          ],
        );
      },
    );
  }

  Future<void> _showTopUpDialog([int presetAmount = 1000]) async {
    final controller = TextEditingController(text: presetAmount.toString());
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext ctx) {
        return Container(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.surfaceContainer : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.lightDivider),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.successGreen.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.phone_android_rounded, color: AppTheme.successGreen, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Top Up with M-Pesa',
                        style: AppTheme.montserrat(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      Text(
                        'Instant STK push notification',
                        style: AppTheme.plusJakartaSans(
                          fontSize: 12,
                          color: isDark ? Colors.white60 : Colors.black54,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                'ENTER AMOUNT (KES)',
                style: AppTheme.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.0,
                  color: isDark ? Colors.white54 : Colors.black54,
                ),
              ),
              const SizedBox(height: 8),
              TextField(
                controller: controller,
                keyboardType: TextInputType.number,
                style: AppTheme.montserrat(fontSize: 22, fontWeight: FontWeight.bold, color: isDark ? AppTheme.primaryColor : Colors.black),
                decoration: InputDecoration(
                  prefixText: 'KES ',
                  prefixStyle: AppTheme.montserrat(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
                  filled: true,
                  fillColor: isDark ? AppTheme.surfaceDim : const Color(0xFFF3F4F6),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppTheme.primaryColor, width: 1.8),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              // Preset quick chips
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [500, 1000, 2500, 5000].map((amt) {
                  return InkWell(
                    onTap: () => controller.text = amt.toString(),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.surfaceBright : const Color(0xFFF0F2F5),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isDark ? AppTheme.outlineBorder : Colors.transparent),
                      ),
                      child: Text(
                        '+$amt',
                        style: AppTheme.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppTheme.primaryColor : Colors.black87,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                height: 52,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(26),
                  gradient: AppTheme.goldGradient,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryColor.withValues(alpha: 0.35),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: () {
                    final amount = controller.text;
                    Navigator.of(ctx).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('M-Pesa STK push for KES $amount sent! Enter PIN on your phone.'),
                        backgroundColor: AppTheme.surfaceContainerHighest,
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                    elevation: 0,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.bolt_rounded, color: Colors.black, size: 20),
                      const SizedBox(width: 6),
                      Text(
                        'SEND M-PESA PROMPT',
                        style: AppTheme.montserrat(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          letterSpacing: 0.5,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.obsidianCanvas : AppTheme.lightBackground,
      appBar: AppBar(
        title: Text(
          'My Wallet',
          style: AppTheme.montserrat(fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black87),
        ),
        elevation: 0,
        backgroundColor: isDark ? AppTheme.surfaceDim : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black87,
        iconTheme: IconThemeData(color: isDark ? AppTheme.primaryColor : Colors.black87),
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _walletFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
          }

          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}', style: TextStyle(color: isDark ? Colors.white70 : Colors.black87)));
          }

          final walletData = snapshot.data;
          if (walletData == null) {
            return Center(child: Text('Could not load wallet details.', style: TextStyle(color: isDark ? Colors.white70 : Colors.black87)));
          }

          final balance = ((walletData['balance'] ?? 0) as num).toDouble();
          final transactions = (walletData['transactions'] as List?) ?? [];
          final payoutMethod = (walletData['payoutMethod'] as Map?) ?? {
            'bankName': 'Not set',
            'accountNumber': '—',
          };

          return RefreshIndicator(
            color: AppTheme.primaryColor,
            onRefresh: () async => _fetchData(),
            child: ListView(
              padding: const EdgeInsets.all(20.0),
              children: [
                // Premium Balance Card (Stitch Obsidian Gold)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.surfaceContainer : Colors.black,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: isDark ? AppTheme.outlineGold : Colors.white12, width: 1.0),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      )
                    ],
                  ),
                  child: Column(
                    children: [
                      Text(
                        'AVAILABLE BALANCE',
                        style: AppTheme.inter(
                          color: isDark ? AppTheme.primaryLight.withValues(alpha: 0.7) : Colors.white54,
                          letterSpacing: 1.5,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'KES ${balance.toStringAsFixed(2)}',
                        style: AppTheme.montserrat(
                          color: AppTheme.primaryColor,
                          fontSize: 38,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Quick top up preset chips
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [500, 1000, 2500].map((amt) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: InkWell(
                              onTap: () => _showTopUpDialog(amt),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                decoration: BoxDecoration(
                                  color: AppTheme.surfaceBright,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppTheme.outlineBorder),
                                ),
                                child: Text(
                                  '+KES $amt',
                                  style: AppTheme.inter(
                                    fontSize: 10.5,
                                    color: AppTheme.primaryColor,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              height: 48,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                gradient: AppTheme.goldGradient,
                              ),
                              child: ElevatedButton(
                                onPressed: () => _showTopUpDialog(1000),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.transparent,
                                  shadowColor: Colors.transparent,
                                  foregroundColor: Colors.black,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  elevation: 0,
                                ),
                                child: Text(
                                  'TOP UP',
                                  style: AppTheme.inter(fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 0.5, color: Colors.black),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: SizedBox(
                              height: 48,
                              child: OutlinedButton(
                                onPressed: () => _showCashOutDialog(balance),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: isDark ? Colors.white : Colors.white,
                                  side: BorderSide(color: isDark ? AppTheme.outlineBorder : Colors.white24),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: Text(
                                  'WITHDRAW',
                                  style: AppTheme.inter(fontWeight: FontWeight.w600, fontSize: 13, letterSpacing: 0.5, color: Colors.white),
                                ),
                              ),
                            ),
                          ),
                        ],
                      )
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Referral Card (Replaced purple with Obsidian & Metallic Gold)
                InkWell(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ReferralScreen()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.surfaceContainer : Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryContainer,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppTheme.outlineGold),
                          ),
                          child: const Icon(Icons.card_giftcard, color: AppTheme.primaryColor, size: 22),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Referral Rewards',
                                style: AppTheme.montserrat(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: isDark ? Colors.white : Colors.black87,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                _isLoadingReferral
                                    ? 'Loading rewards...'
                                    : 'Earned KES ${_referralEarned.toStringAsFixed(0)}',
                                style: AppTheme.plusJakartaSans(
                                  color: isDark ? Colors.white60 : Colors.grey[600],
                                  fontSize: 12.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTheme.primaryColor),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 28),

                // Payout Method Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'PAYOUT METHOD',
                      style: AppTheme.inter(
                        fontWeight: FontWeight.bold,
                        color: isDark ? Colors.white54 : Colors.grey[600],
                        fontSize: 11,
                        letterSpacing: 1.1,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const PayoutSetupScreen()),
                        );
                      },
                      child: Text('Manage', style: AppTheme.inter(fontSize: 12, color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                    )
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.surfaceContainer : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isDark ? AppTheme.outlineBorder : Colors.grey.shade200),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isDark ? AppTheme.surfaceBright : Colors.grey[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(Icons.account_balance_rounded, color: isDark ? AppTheme.primaryColor : Colors.black87, size: 20),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              payoutMethod['bankName'],
                              style: AppTheme.plusJakartaSans(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: isDark ? Colors.white : Colors.black87,
                              ),
                            ),
                            Text(
                              payoutMethod['accountNumber'],
                              style: AppTheme.inter(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
                            ),
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right_rounded, color: isDark ? Colors.white38 : Colors.black38),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // Recent Activities
                Text(
                  'RECENT ACTIVITY',
                  style: AppTheme.inter(
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white54 : Colors.grey[600],
                    fontSize: 11,
                    letterSpacing: 1.1,
                  ),
                ),
                const SizedBox(height: 12),
                if (transactions.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Center(
                      child: Text(
                        'No transactions yet.',
                        style: AppTheme.plusJakartaSans(color: isDark ? Colors.white38 : Colors.grey, fontSize: 13),
                      ),
                    ),
                  )
                else
                  ...transactions.map((tx) {
                    final isCredit = tx['type'].toString().toLowerCase().contains('top') ||
                        tx['type'].toString().toLowerCase().contains('credit');

                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.surfaceContainer : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: isDark ? AppTheme.outlineBorder : Colors.grey.shade200),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 18,
                            backgroundColor: isCredit
                                ? AppTheme.successGreen.withValues(alpha: 0.15)
                                : AppTheme.surfaceBright,
                            child: Icon(
                              isCredit ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                              color: isCredit ? AppTheme.successGreen : AppTheme.primaryColor,
                              size: 16,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${tx['type']}',
                                  style: AppTheme.montserrat(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13.5,
                                    color: isDark ? Colors.white : Colors.black87,
                                  ),
                                ),
                                Text(
                                  '${tx['date']}',
                                  style: AppTheme.inter(fontSize: 11, color: isDark ? Colors.white38 : Colors.black38),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${isCredit ? "+" : "-"}KES ${tx['amount'].toStringAsFixed(0)}',
                            style: AppTheme.montserrat(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: isCredit ? AppTheme.successGreen : (isDark ? Colors.white : Colors.black87),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),

                const SizedBox(height: 30),
              ],
            ),
          );
        },
      ),
    );
  }
}

