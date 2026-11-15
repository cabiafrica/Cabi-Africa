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
  bool _autoReloadActive = true;
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
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return AlertDialog(
          backgroundColor: isDark ? AppTheme.surfaceContainer : Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Confirm Payout',
            style: AppTheme.montserrat(
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          content: Text(
            'Are you sure you want to cash out KES ${balance.toStringAsFixed(2)} to your registered payout account?',
            style: AppTheme.plusJakartaSans(
              color: isDark ? Colors.white70 : Colors.black87,
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Cancel', style: TextStyle(color: isDark ? Colors.white54 : Colors.grey)),
              onPressed: () => Navigator.of(context).pop(),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: isDark ? AppTheme.primaryColor : AppTheme.aurumBronze,
                foregroundColor: isDark ? Colors.black : Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Confirm', style: TextStyle(fontWeight: FontWeight.bold)),
              onPressed: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Payout initiated to your M-Pesa account!'),
                    backgroundColor: AppTheme.surfaceContainerHighest,
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }

  Future<void> _showTopUpDialog([int presetAmount = 2500]) async {
    final controller = TextEditingController(text: presetAmount.toString());
    int selectedAmount = presetAmount;

    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;

        return StatefulBuilder(
          builder: (context, setModalState) {
            final formattedAmt = controller.text.isNotEmpty ? controller.text : '0';

            return Container(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 18,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.surfaceContainer : Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
                border: Border.all(color: isDark ? AppTheme.outlineGold : AppTheme.lightDivider),
                boxShadow: [
                  BoxShadow(
                    color: isDark ? Colors.black.withValues(alpha: 0.5) : Colors.black.withValues(alpha: 0.08),
                    blurRadius: 25,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 4.5,
                      decoration: BoxDecoration(
                        color: isDark ? Colors.white24 : Colors.black12,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.successGreen.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.successGreen.withValues(alpha: 0.3)),
                            ),
                            child: const Icon(Icons.phone_android_rounded, color: AppTheme.successGreen, size: 22),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Wallet M-Pesa Top Up',
                                style: AppTheme.montserrat(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: isDark ? Colors.white : Colors.black87,
                                ),
                              ),
                              Text(
                                'Instant STK Push to Phone',
                                style: AppTheme.plusJakartaSans(
                                  fontSize: 12,
                                  color: isDark ? Colors.white60 : Colors.black54,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryContainer.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.outlineGold),
                        ),
                        child: Text(
                          '0% Fee',
                          style: AppTheme.inter(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Reload Tier Bento Grid (Stitch Spec)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'SELECT AMOUNT',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.1,
                          color: isDark ? Colors.white54 : Colors.black54,
                        ),
                      ),
                      Text(
                        'KES',
                        style: AppTheme.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark ? AppTheme.primaryColor : Colors.black54,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 2.3,
                    children: [
                      _buildBentoAmountCard(
                        amount: 500,
                        tag: 'Standard',
                        bonus: null,
                        isSelected: selectedAmount == 500,
                        isDark: isDark,
                        onTap: () {
                          setModalState(() {
                            selectedAmount = 500;
                            controller.text = '500';
                          });
                        },
                      ),
                      _buildBentoAmountCard(
                        amount: 1000,
                        tag: null,
                        bonus: '+50 bonus',
                        isSelected: selectedAmount == 1000,
                        isDark: isDark,
                        onTap: () {
                          setModalState(() {
                            selectedAmount = 1000;
                            controller.text = '1000';
                          });
                        },
                      ),
                      _buildBentoAmountCard(
                        amount: 2500,
                        tag: 'VIP',
                        bonus: '+125 Gold',
                        isSelected: selectedAmount == 2500,
                        isDark: isDark,
                        onTap: () {
                          setModalState(() {
                            selectedAmount = 2500;
                            controller.text = '2500';
                          });
                        },
                      ),
                      _buildBentoAmountCard(
                        amount: 5000,
                        tag: 'Elite',
                        bonus: '+500 VIP',
                        isSelected: selectedAmount == 5000,
                        isDark: isDark,
                        onTap: () {
                          setModalState(() {
                            selectedAmount = 5000;
                            controller.text = '5000';
                          });
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Custom Amount Field
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.surfaceDim : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider,
                      ),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    child: Row(
                      children: [
                        const Icon(Icons.tune_rounded, size: 20, color: AppTheme.primaryColor),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: controller,
                            keyboardType: TextInputType.number,
                            onChanged: (val) {
                              setModalState(() {
                                selectedAmount = int.tryParse(val) ?? 0;
                              });
                            },
                            style: AppTheme.montserrat(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: isDark ? Colors.white : Colors.black,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'Custom Amount',
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                        Text(
                          'KES',
                          style: AppTheme.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Channel Selector
                  Text(
                    'PAYMENT CHANNEL',
                    style: AppTheme.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.1,
                      color: isDark ? Colors.white54 : Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 8),

                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.surfaceBright : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.outlineGold.withValues(alpha: 0.6), width: 1.4),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(7),
                          decoration: BoxDecoration(
                            color: AppTheme.successGreen.withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.phone_iphone_rounded, color: AppTheme.successGreen, size: 18),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    'M-Pesa Express STK',
                                    style: AppTheme.montserrat(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13.5,
                                      color: isDark ? Colors.white : Colors.black87,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                    decoration: BoxDecoration(
                                      color: AppTheme.successGreen.withValues(alpha: 0.2),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      'Fastest',
                                      style: AppTheme.inter(fontSize: 9.5, fontWeight: FontWeight.bold, color: AppTheme.successGreen),
                                    ),
                                  ),
                                ],
                              ),
                              Builder(
                                builder: (context) {
                                  final authState = ref.watch(passengerAuthProvider);
                                  final userMap = authState is Authenticated ? authState.user : null;
                                  final phone = userMap?['phone']?.toString() ?? 'Registered M-Pesa Line';
                                  return Text(
                                    '$phone Prompt',
                                    style: AppTheme.inter(fontSize: 11.5, color: isDark ? Colors.white54 : Colors.grey[600]),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.check_circle_rounded, color: AppTheme.primaryColor, size: 20),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Submit STK Push CTA
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
                        Navigator.of(ctx).pop();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Row(
                              children: [
                                const Icon(Icons.bolt_rounded, color: AppTheme.primaryColor),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text('M-Pesa STK push for KES $formattedAmt initiated! Check your handset.'),
                                ),
                              ],
                            ),
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
                          const SizedBox(width: 8),
                          Text(
                            'TOP UP KES $formattedAmt • STK PUSH',
                            style: AppTheme.montserrat(
                              fontWeight: FontWeight.bold,
                              fontSize: 13.5,
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
      },
    );
  }

  Widget _buildBentoAmountCard({
    required int amount,
    required String? tag,
    required String? bonus,
    required bool isSelected,
    required bool isDark,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? AppTheme.surfaceBright : const Color(0xFFFDF8E8))
              : (isDark ? AppTheme.surfaceContainer : Colors.white),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected
                ? AppTheme.primaryColor
                : (isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
            width: isSelected ? 1.8 : 1.0,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppTheme.primaryColor.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '$amount/-',
                  style: AppTheme.montserrat(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: isSelected
                        ? AppTheme.primaryColor
                        : (isDark ? Colors.white : Colors.black87),
                  ),
                ),
                if (bonus != null)
                  Text(
                    bonus,
                    style: AppTheme.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.successGreen,
                    ),
                  )
                else if (tag != null)
                  Text(
                    tag,
                    style: AppTheme.inter(
                      fontSize: 10,
                      color: isDark ? Colors.white54 : Colors.grey[600],
                    ),
                  ),
              ],
            ),
            Icon(
              isSelected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
              color: isSelected ? AppTheme.primaryColor : (isDark ? Colors.white24 : Colors.grey[400]),
              size: 18,
            ),
          ],
        ),
      ),
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
          style: AppTheme.montserrat(
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
            fontSize: 18,
          ),
        ),
        elevation: 0,
        backgroundColor: isDark ? AppTheme.surfaceDim : Colors.white,
        foregroundColor: isDark ? Colors.white : Colors.black87,
        iconTheme: IconThemeData(color: isDark ? AppTheme.primaryColor : Colors.black87),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.surfaceBright : const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? AppTheme.outlineGold.withValues(alpha: 0.3) : AppTheme.lightDivider,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.verified_user_rounded, color: AppTheme.successGreen, size: 14),
                const SizedBox(width: 5),
                Text(
                  'VIP Safe',
                  style: AppTheme.inter(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppTheme.primaryLight : Colors.black87,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _walletFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor));
          }

          if (snapshot.hasError) {
            return Center(
              child: Text('Error: ${snapshot.error}', style: TextStyle(color: isDark ? Colors.white70 : Colors.black87)),
            );
          }

          final walletData = snapshot.data;
          if (walletData == null) {
            return Center(
              child: Text('Could not load wallet details.', style: TextStyle(color: isDark ? Colors.white70 : Colors.black87)),
            );
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
                // Premium Executive Balance Card (Stitch Obsidian Gold)
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.surfaceContainer : Colors.black,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: isDark ? AppTheme.outlineGold : Colors.white12, width: 1.0),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: isDark ? 0.5 : 0.2),
                        blurRadius: 20,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.account_balance_wallet_rounded, color: AppTheme.primaryColor, size: 18),
                              const SizedBox(width: 6),
                              Text(
                                'AVAILABLE BALANCE',
                                style: AppTheme.inter(
                                  color: isDark ? AppTheme.primaryLight.withValues(alpha: 0.7) : Colors.white54,
                                  letterSpacing: 1.5,
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryContainer.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppTheme.outlineGold.withValues(alpha: 0.5)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.verified_rounded, color: AppTheme.primaryColor, size: 12),
                                const SizedBox(width: 4),
                                Text(
                                  'Executive Tier',
                                  style: AppTheme.inter(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryLight,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'KES ${balance.toStringAsFixed(2)}',
                        style: AppTheme.montserrat(
                          color: AppTheme.primaryColor,
                          fontSize: 38,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Connected Phone & Status Chip
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isDark ? AppTheme.surfaceBright : Colors.white10,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isDark ? AppTheme.outlineBorder : Colors.white12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.sim_card_rounded, color: AppTheme.primaryColor, size: 16),
                                const SizedBox(width: 8),
                                Builder(
                                  builder: (context) {
                                    final authState = ref.watch(passengerAuthProvider);
                                    final userMap = authState is Authenticated ? authState.user : null;
                                    final phone = userMap?['phone']?.toString() ?? 'M-Pesa Account';
                                    return Text(
                                      phone,
                                      style: AppTheme.inter(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: isDark ? Colors.white : Colors.white,
                                      ),
                                    );
                                  },
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '• M-Pesa Verified',
                                  style: AppTheme.inter(
                                    fontSize: 11,
                                    color: AppTheme.successGreen,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            const Icon(Icons.verified_user_rounded, color: AppTheme.successGreen, size: 16),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Auto-reload toggle strip
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.sync_rounded, color: isDark ? Colors.white54 : Colors.white60, size: 16),
                              const SizedBox(width: 6),
                              Text(
                                'Auto-reload when < KES 1,000',
                                style: AppTheme.plusJakartaSans(
                                  fontSize: 12,
                                  color: isDark ? Colors.white60 : Colors.white70,
                                ),
                              ),
                            ],
                          ),
                          Switch.adaptive(
                            value: _autoReloadActive,
                            activeThumbColor: AppTheme.primaryColor,
                            activeTrackColor: AppTheme.primaryContainer,
                            onChanged: (val) {
                              setState(() {
                                _autoReloadActive = val;
                              });
                            },
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Action Buttons
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
                                onPressed: () => _showTopUpDialog(2500),
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
                                  foregroundColor: Colors.white,
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
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Referral Card (Obsidian & Metallic Gold)
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
                    ),
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
