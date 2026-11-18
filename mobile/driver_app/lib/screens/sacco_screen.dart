import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:core_ui/core_ui.dart';
import '../services/sacco_service.dart';
import '../providers/auth_provider.dart';
import '../widgets/sos_button.dart';

class SaccoScreen extends ConsumerStatefulWidget {
  const SaccoScreen({super.key});

  @override
  ConsumerState<SaccoScreen> createState() => _SaccoScreenState();
}

class _SaccoScreenState extends ConsumerState<SaccoScreen> {
  bool _isLoading = true;
  bool _isSaving = false;
  Map<String, dynamic> _balanceData = {};
  List<SaccoTransaction> _transactions = [];
  double _savingsRate = 2.0;
  bool _isWelfareEnabled = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final authState = ref.read(authProvider);
      final driverId = authState.userId ?? 'driver-current';
      final saccoService = ref.read(saccoServiceProvider);

      final balanceFuture = saccoService.getSavingsBalance(driverId);
      final txFuture = saccoService.getTransactions(driverId);

      final results = await Future.wait([balanceFuture, txFuture]);
      final balanceMap = results[0] as Map<String, dynamic>;
      final txList = results[1] as List<SaccoTransaction>;

      if (mounted) {
        setState(() {
          _balanceData = balanceMap;
          _transactions = txList;
          _savingsRate = double.tryParse(balanceMap['currentSavingsRate']?.toString() ?? '2') ?? 2.0;
          _isWelfareEnabled = balanceMap['isWelfareEnabled'] != false;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isSaving = true);
    try {
      final authState = ref.read(authProvider);
      final driverId = authState.userId ?? 'driver-current';
      final saccoService = ref.read(saccoServiceProvider);

      final ok = await saccoService.updateSavingsSettings(
        driverId: driverId,
        savingsRate: _savingsRate,
        isWelfareEnabled: _isWelfareEnabled,
      );

      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              ok
                  ? 'Remittance settings updated successfully (${_savingsRate.toStringAsFixed(1)}% per trip)'
                  : 'Unable to save settings. Please retry.',
            ),
            backgroundColor: ok ? const Color(0xFF0F766E) : const Color(0xFFB91C1C),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error updating settings: $e'),
            backgroundColor: const Color(0xFFB91C1C),
          ),
        );
      }
    }
  }

  String _formatAmount(double amt) {
    if (amt % 1 == 0) {
      return amt.toInt().toString();
    }
    return amt.toStringAsFixed(2);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final l10n = CabiLocalizations.of(context);

    final totalSavings = double.tryParse(_balanceData['totalSavings']?.toString() ?? '0') ?? 0.0;
    final availableWithdrawal = double.tryParse(_balanceData['availableWithdrawal']?.toString() ?? '') ?? (totalSavings * 0.3);
    final saccoName = _balanceData['saccoName']?.toString() ?? 'CABI Sacco';
    final memberNumber = _balanceData['membershipNumber']?.toString() ?? 'SACCO-MEMBER';

    final bgColor = isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC);
    final cardBg = isDark ? const Color(0xFF1E293B) : Colors.white;
    final borderColor = isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0);
    final textPrimary = isDark ? Colors.white : const Color(0xFF0F172A);
    final textSecondary = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    const accentColor = Color(0xFF00C853);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: cardBg,
        elevation: 0,
        centerTitle: false,
        title: Text(
          saccoName,
          style: TextStyle(
            color: textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12),
            child: SosButton(size: 38),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // ── MEMBERSHIP STATUS BADGE CARD ──
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: accentColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.verified_user_rounded,
                        color: accentColor,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            saccoName,
                            style: TextStyle(
                              color: textPrimary,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            memberNumber,
                            style: TextStyle(
                              color: textSecondary,
                              fontSize: 12,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F766E).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF0F766E).withOpacity(0.3)),
                      ),
                      child: const Text(
                        'Active Member',
                        style: TextStyle(
                          color: Color(0xFF14B8A6),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // ── TOTAL SAVINGS HERO CARD ──
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: borderColor),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(isDark ? 0.3 : 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
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
                          l10n.accumulatedSavings,
                          style: TextStyle(
                            color: textSecondary,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: accentColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.trending_up_rounded, color: accentColor, size: 14),
                              SizedBox(width: 4),
                              Text(
                                '+3% Cabi Match',
                                style: TextStyle(
                                  color: accentColor,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'KES ${totalSavings.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: textPrimary,
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 14),
                    const Divider(height: 1),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              l10n.emergencyLiquidity,
                              style: TextStyle(
                                color: textSecondary,
                                fontSize: 11,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'KES ${availableWithdrawal.toStringAsFixed(2)}',
                              style: TextStyle(
                                color: textPrimary,
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(
                          height: 44,
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: accentColor,
                              foregroundColor: Colors.black,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(horizontal: 18),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Loan module launching soon!'),
                                  backgroundColor: Color(0xFF1E293B),
                                  duration: Duration(seconds: 3),
                                ),
                              );
                            },
                            child: const Text(
                              'APPLY',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // ── PERCENTAGE REMITTANCE CONFIGURATOR ──
              Text(
                'PER-TRIP PERCENTAGE REMITTANCE',
                style: TextStyle(
                  color: textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          l10n.savingsRate,
                          style: TextStyle(
                            color: textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: accentColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${_savingsRate.toStringAsFixed(1)}% per trip',
                            style: const TextStyle(
                              color: accentColor,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Quick Chips
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [1.0, 2.0, 3.0, 5.0].map((rate) {
                        final isSelected = (_savingsRate - rate).abs() < 0.05;
                        return ChoiceChip(
                          label: Text(
                            rate == 2.0 ? '2.0% (Default)' : '${rate.toStringAsFixed(1)}%',
                            style: TextStyle(
                              color: isSelected ? Colors.black : textPrimary,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              fontSize: 12,
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: accentColor,
                          backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
                          onSelected: (selected) {
                            if (selected) {
                              setState(() => _savingsRate = rate);
                            }
                          },
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 12),

                    Slider(
                      value: _savingsRate,
                      min: 0.5,
                      max: 10.0,
                      divisions: 19,
                      activeColor: accentColor,
                      inactiveColor: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                      label: '${_savingsRate.toStringAsFixed(1)}%',
                      onChanged: (val) {
                        setState(() => _savingsRate = val);
                      },
                    ),

                    const SizedBox(height: 12),

                    // Dynamic Live Simulation Card
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.calculate_outlined, size: 16, color: accentColor),
                              const SizedBox(width: 6),
                              Text(
                                'Live Simulation (KES 1,000 Sample Trip)',
                                style: TextStyle(
                                  color: textPrimary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Your Sacco Saving (${_savingsRate.toStringAsFixed(1)}%)',
                                  style: TextStyle(color: textSecondary, fontSize: 12)),
                              Text(
                                'KES ${(1000 * _savingsRate / 100).toStringAsFixed(2)}',
                                style: TextStyle(color: textPrimary, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Cabi Incentive Match (+3.0%)',
                                  style: TextStyle(color: textSecondary, fontSize: 12)),
                              const Text(
                                'KES 30.00',
                                style: TextStyle(color: accentColor, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(vertical: 6),
                            child: Divider(height: 1),
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Total Credited to Sacco Account',
                                  style: TextStyle(color: textPrimary, fontSize: 12, fontWeight: FontWeight.w600)),
                              Text(
                                'KES ${(1000 * (_savingsRate + 3.0) / 100).toStringAsFixed(2)}',
                                style: const TextStyle(color: accentColor, fontSize: 13, fontWeight: FontWeight.w800),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Daily Welfare Fund Switch
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      activeColor: accentColor,
                      title: Text(
                        l10n.dailyWelfare,
                        style: TextStyle(
                          color: textPrimary,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      subtitle: Text(
                        'KES 50 / active driving day for emergency welfare pool',
                        style: TextStyle(
                          color: textSecondary,
                          fontSize: 11,
                        ),
                      ),
                      value: _isWelfareEnabled,
                      onChanged: (val) {
                        setState(() => _isWelfareEnabled = val);
                      },
                    ),

                    const SizedBox(height: 10),

                    // Option A Policy Callout
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0369A1).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF0369A1).withOpacity(0.3)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.info_outline_rounded, color: Color(0xFF38BDF8), size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Cash Trip Policy (Option A): Percentage deductions on cash trips are automatically absorbed by digital wallet buffer, allowing balances down to -5,000 KES before dispatch lock.',
                              style: TextStyle(
                                color: isDark ? const Color(0xFFBAE6FD) : const Color(0xFF0369A1),
                                fontSize: 11,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: accentColor,
                          foregroundColor: Colors.black,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: _isSaving ? null : _saveSettings,
                        child: _isSaving
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                              )
                            : const Text(
                                'SAVE REMITTANCE SETTINGS',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.5,
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // ── REMITTANCE HISTORY LEDGER ──
              Text(
                l10n.saccoRemittanceLedger.toUpperCase(),
                style: TextStyle(
                  color: textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 10),

              if (_transactions.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 20),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: borderColor),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.receipt_long_outlined, size: 40, color: textSecondary.withOpacity(0.5)),
                      const SizedBox(height: 10),
                      Text(
                        'No deductions yet',
                        style: TextStyle(
                          color: textPrimary,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Your completed trips will record automatic percentage savings here.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: textSecondary,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _transactions.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final tx = _transactions[index];
                    final amtStr = _formatAmount(tx.amount);
                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: borderColor),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: accentColor.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.arrow_downward_rounded,
                              color: accentColor,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Sacco Deduction',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  tx.date.isNotEmpty
                                      ? tx.date.split('T').first
                                      : 'Settled Trip',
                                  style: TextStyle(
                                    color: textSecondary,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '+KES $amtStr',
                            style: const TextStyle(
                              color: accentColor,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
