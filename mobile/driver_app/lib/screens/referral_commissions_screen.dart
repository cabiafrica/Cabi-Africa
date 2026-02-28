import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/services.dart';
import 'downline_screen.dart';
import '../services/referral_service.dart';
import '../providers/auth_provider.dart';
// import '../theme/app_theme.dart'; // Removed unused import

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
                              color: Color(0xFFFFD700),
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
                                  color: const Color(0xFFFFD700)
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
}
