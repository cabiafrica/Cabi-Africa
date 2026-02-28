import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/referral_service.dart';
import '../providers/auth_provider.dart';

class ReferralScreen extends StatefulWidget {
  const ReferralScreen({super.key});

  @override
  State<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends State<ReferralScreen> {
  final PassengerReferralService _referralService = PassengerReferralService();
  String _myReferralCode = '...';
  bool _isLoading = true;
  final TextEditingController _codeController = TextEditingController();
  bool _isApplying = false;

  double _totalEarned = 0.0;
  List<dynamic> _referralHistory = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchData();
    });
  }

  Future<void> _fetchData() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.userId;

    if (userId == null) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _myReferralCode = 'LOGIN-REQ';
        });
      }
      return;
    }

    try {
      final code = await _referralService.getReferralCode(userId);
      final historyData = await _referralService.getReferralHistory(userId);

      if (mounted) {
        setState(() {
          _myReferralCode = code ?? 'CAB-USER';
          _totalEarned =
              double.tryParse(historyData['totalEarned'].toString()) ?? 0.0;
          _referralHistory = historyData['history'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _myReferralCode = 'ERROR';
        });
      }
    }
  }

  Future<void> _applyCode() async {
    if (_codeController.text.trim().isEmpty) return;

    setState(() => _isApplying = true);

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.userId;

    if (userId == null) {
      setState(() => _isApplying = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Please login to apply code'),
          backgroundColor: Colors.red,
        ));
      }
      return;
    }

    try {
      final result = await _referralService.applyReferralCode(
          userId, _codeController.text.trim());

      setState(() => _isApplying = false);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(result['message'] ??
              (result['success'] ? 'Code applied!' : 'Failed')),
          backgroundColor: result['success'] ? Colors.green : Colors.red,
        ));
        if (result['success']) {
          _codeController.clear();
          _fetchData(); // Refresh data to show potentially new referrals
        }
      }
    } catch (e) {
      setState(() => _isApplying = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ));
      }
    }
  }

  void _shareReferralCode() {
    Clipboard.setData(ClipboardData(text: _myReferralCode));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Referral code copied to clipboard!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Refer Friends')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Referral Code Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Colors.purple, Colors.deepPurple],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.card_giftcard,
                            color: Colors.white, size: 48),
                        const SizedBox(height: 16),
                        const Text(
                          'Refer & Earn',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Share your code with friends. When they take their first ride, you earn bonuses!',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            children: [
                              const Text('Your Referral Code',
                                  style: TextStyle(
                                      fontSize: 12, color: Colors.grey)),
                              const SizedBox(height: 8),
                              Text(
                                _myReferralCode,
                                style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: _shareReferralCode,
                          icon: const Icon(Icons.share),
                          label: const Text('SHARE CODE'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: Colors.purple,
                            minimumSize: const Size.fromHeight(50),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Stats Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildStat('Successful Referrals',
                              _referralHistory.length.toString()),
                          Container(
                              width: 1, height: 40, color: Colors.grey[300]),
                          _buildStat('Total Earned',
                              'KES ${_totalEarned.toStringAsFixed(2)}'),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),
                  const Text('Referral History',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),

                  // Referral History
                  ..._referralHistory.map((referral) => Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.green[100],
                            child: const Icon(
                              Icons.check,
                              color: Colors.green,
                            ),
                          ),
                          title:
                              Text(referral['description'] ?? 'Referral Bonus'),
                          subtitle: Text(
                            _formatDate(referral['date']),
                          ),
                          trailing: Text(
                            '+KES ${double.tryParse(referral['amount'].toString())?.toStringAsFixed(2) ?? '0.00'}',
                            style: const TextStyle(
                              color: Colors.green,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      )),
                  if (_referralHistory.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: Text(
                          'No referrals yet. Share your code to get started!',
                          style: TextStyle(color: Colors.grey),
                        ),
                      ),
                    ),

                  const Divider(height: 48),

                  // Apply Code Section
                  const Text(
                    'Have a promo code?',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _codeController,
                          decoration: const InputDecoration(
                            hintText: 'Enter code',
                            border: OutlineInputBorder(),
                            contentPadding:
                                EdgeInsets.symmetric(horizontal: 16),
                          ),
                          textCapitalization: TextCapitalization.characters,
                        ),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton(
                        onPressed: _isApplying ? null : _applyCode,
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(100, 48),
                          backgroundColor: Colors.purple,
                          foregroundColor: Colors.white,
                        ),
                        child: _isApplying
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white))
                            : const Text('APPLY'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  Widget _buildStat(String label, String value) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
      ],
    );
  }

  String _formatDate(dynamic d) {
    if (d == null) return 'N/A';
    DateTime dt;
    if (d is String) {
      dt = DateTime.parse(d);
    } else if (d is DateTime) {
      dt = d;
    } else {
      return 'N/A';
    }
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
