import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/sacco_service.dart';
import '../providers/auth_provider.dart';

class SaccoScreen extends ConsumerStatefulWidget {
  const SaccoScreen({super.key});

  @override
  ConsumerState<SaccoScreen> createState() => _SaccoScreenState();
}

class _SaccoScreenState extends ConsumerState<SaccoScreen> {
  bool _isLoading = true;
  double _savingsBalance = 0.0;
  List<SaccoTransaction> _transactions = [];
  late final SaccoService _saccoService;

  @override
  void initState() {
    super.initState();
    _saccoService = ref.read(saccoServiceProvider);
    _fetchSaccoData();
  }

  Future<void> _fetchSaccoData() async {
    setState(() => _isLoading = true);

    final authState = ref.read(authProvider);
    String? driverId;

    if (authState is Authenticated) {
      driverId = authState.userId;
    }

    if (driverId == null) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      return;
    }

    try {
      final balanceData = await _saccoService.getSavingsBalance(driverId);
      final transactionList = await _saccoService.getTransactions(driverId);

      if (mounted) {
        setState(() {
          _savingsBalance = double.tryParse(
                  balanceData['totalSavings']?.toString() ?? '0.0') ??
              0.0;
          _transactions = transactionList;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Business logic: Loan eligibility is typically 3x savings
    final loanEligibility = _savingsBalance * 3.0;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text('CABI Sacco'),
        elevation: 0,
        backgroundColor: const Color(0xFF1A237E), // Deep Indigo
        foregroundColor: Colors.white,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchSaccoData,
              child: CustomScrollView(
                slivers: [
                  // Balance & Eligibility Card
                  SliverToBoxAdapter(
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: const BoxDecoration(
                        color: Color(0xFF1A237E),
                        borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(32),
                          bottomRight: Radius.circular(32),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'TOTAL SAVINGS',
                            style: TextStyle(
                                color: Colors.white60,
                                letterSpacing: 1.2,
                                fontSize: 12),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'KES ${_savingsBalance.toStringAsFixed(2)}',
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 36,
                                fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 24),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.verified_user,
                                    color: Colors.greenAccent, size: 20),
                                const SizedBox(width: 12),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'LOAN ELIGIBILITY',
                                      style: TextStyle(
                                          color: Colors.white54, fontSize: 10),
                                    ),
                                    Text(
                                      'KES ${loanEligibility.toStringAsFixed(0)}',
                                      style: const TextStyle(
                                          color: Colors.white,
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ],
                                ),
                                const Spacer(),
                                TextButton(
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                            content: Text(
                                                'Loan module launching soon!')));
                                  },
                                  style: TextButton.styleFrom(
                                    foregroundColor: Colors.greenAccent,
                                  ),
                                  child: const Text('APPLY'),
                                )
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Action Quick Links
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 24),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildQuickAction(Icons.add_card, 'Deposit', () {}),
                          _buildQuickAction(
                              Icons.receipt_long, 'Statement', () {}),
                          _buildQuickAction(Icons.quiz, 'Help', () {}),
                        ],
                      ),
                    ),
                  ),

                  // Section Header
                  const SliverToBoxAdapter(
                    child: Padding(
                      padding:
                          EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                      child: Text(
                        'SAVINGS HISTORY',
                        style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey),
                      ),
                    ),
                  ),

                  // Transactions List
                  if (_transactions.isEmpty)
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: Center(
                        child: Text('No savings records yet.',
                            style: TextStyle(color: Colors.grey)),
                      ),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final item = _transactions[index];
                          final date =
                              DateTime.tryParse(item.date) ?? DateTime.now();
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 4),
                            child: Card(
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(color: Colors.grey.shade200),
                              ),
                              child: ListTile(
                                leading: Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.indigo[50],
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.savings_outlined,
                                      color: Colors.indigo),
                                ),
                                title: const Text(
                                  'Sacco Deduction',
                                  style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14),
                                ),
                                subtitle: Text(
                                  '${date.day}/${date.month}/${date.year} • ${item.type}',
                                  style: const TextStyle(fontSize: 12),
                                ),
                                trailing: Text(
                                  '+KES ${item.amount.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green,
                                      fontSize: 16),
                                ),
                              ),
                            ),
                          );
                        },
                        childCount: _transactions.length,
                      ),
                    ),

                  const SliverPadding(padding: EdgeInsets.only(bottom: 40)),
                ],
              ),
            ),
    );
  }

  Widget _buildQuickAction(IconData icon, String label, VoidCallback onTap) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Icon(icon, color: const Color(0xFF1A237E)),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }
}
