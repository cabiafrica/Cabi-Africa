import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/referral_service.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

enum ReferralType { passenger, driver }

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

  ReferralType _selectedType = ReferralType.passenger;

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
    String message = '';
    if (_selectedType == ReferralType.passenger) {
      message =
          'Join Cabi Africa and get bonuses on your first rides! Use my code: $_myReferralCode\nDownload now: https://cabi.africa/p';
    } else {
      message =
          'Join Cabi Africa as a driver and earn more! Use my referral code: $_myReferralCode\nSign up here: https://cabi.africa/d';
    }

    Clipboard.setData(ClipboardData(text: message));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
            'Referral ${_selectedType == ReferralType.passenger ? "Passenger" : "Driver"} invite copied!'),
        backgroundColor: AppTheme.successGreen,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Refer & Earn'),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Referral Type Segmented Control
                  Center(
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkSurface : Colors.grey[200],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(
                                  () => _selectedType = ReferralType.passenger),
                              child: Container(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: _selectedType == ReferralType.passenger
                                      ? AppTheme.primaryColor
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(10),
                                  boxShadow: _selectedType ==
                                          ReferralType.passenger
                                      ? [
                                          BoxShadow(
                                              color: AppTheme.primaryColor
                                                  .withValues(alpha: 0.3),
                                              blurRadius: 8,
                                              offset: const Offset(0, 2))
                                        ]
                                      : null,
                                ),
                                child: Center(
                                  child: Text(
                                    'Refer Passenger',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: _selectedType ==
                                              ReferralType.passenger
                                          ? Colors.black
                                          : (isDark
                                              ? Colors.white70
                                              : Colors.black54),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(
                                  () => _selectedType = ReferralType.driver),
                              child: Container(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: _selectedType == ReferralType.driver
                                      ? AppTheme.primaryColor
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(10),
                                  boxShadow:
                                      _selectedType == ReferralType.driver
                                          ? [
                                              BoxShadow(
                                                  color: AppTheme.primaryColor
                                                      .withValues(alpha: 0.3),
                                                  blurRadius: 8,
                                                  offset: const Offset(0, 2))
                                            ]
                                          : null,
                                ),
                                child: Center(
                                  child: Text(
                                    'Refer Driver',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: _selectedType ==
                                              ReferralType.driver
                                          ? Colors.black
                                          : (isDark
                                              ? Colors.white70
                                              : Colors.black54),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Referral Code Card
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppTheme.primaryColor,
                          AppTheme.secondaryAmber,
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primaryColor.withValues(alpha: 0.2),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        )
                      ],
                    ),
                    child: Column(
                      children: [
                        Icon(
                          _selectedType == ReferralType.passenger
                              ? Icons.person_add_alt_1
                              : Icons.drive_eta,
                          color: Colors.black,
                          size: 48,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _selectedType == ReferralType.passenger
                              ? 'Invite a Passenger'
                              : 'Invite a Driver',
                          style: const TextStyle(
                            color: Colors.black,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _selectedType == ReferralType.passenger
                              ? 'Share your code with friends. When they take their first ride, you both earn rewards!'
                              : 'Help grow our fleet! Refer a driver and earn commissions on their successful trips.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.black.withValues(alpha: 0.7),
                            fontSize: 14,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              vertical: 16, horizontal: 24),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                                color: Colors.black.withValues(alpha: 0.1)),
                          ),
                          child: Column(
                            children: [
                              Text(
                                'YOUR UNIQUE CODE',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black.withValues(alpha: 0.5),
                                  letterSpacing: 1.2,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                _myReferralCode,
                                style: const TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 4,
                                  color: Colors.black,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: _shareReferralCode,
                          icon: const Icon(Icons.share_rounded, size: 20),
                          label: const Text('INVITE NOW'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.black,
                            foregroundColor: AppTheme.primaryColor,
                            minimumSize: const Size.fromHeight(56),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Stats Row
                  Row(
                    children: [
                      Expanded(
                        child: _buildStatCard(
                          'Referrals',
                          _referralHistory.length.toString(),
                          Icons.group_outlined,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _buildStatCard(
                          'Earnings',
                          'KES ${_totalEarned.toStringAsFixed(0)}',
                          Icons.account_balance_wallet_outlined,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // History Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Recent Activity',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton(
                        onPressed: () {},
                        child: const Text('View All'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Referral History List
                  if (_referralHistory.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 40),
                        child: Column(
                          children: [
                            Icon(Icons.history_toggle_off,
                                size: 48, color: Colors.grey.withValues(alpha: 0.5)),
                            const SizedBox(height: 16),
                            const Text(
                              'No referral history yet.',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ..._referralHistory.take(5).map((referral) => Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            color: isDark ? AppTheme.darkSurface : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDark
                                  ? AppTheme.darkDivider
                                  : Colors.grey[200]!,
                            ),
                          ),
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppTheme.successGreen.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.check_circle_outline,
                                color: AppTheme.successGreen,
                                size: 24,
                              ),
                            ),
                            title: Text(
                              referral['description'] ?? 'Referral Bonus',
                              style:
                                  const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            subtitle: Text(
                              _formatDate(referral['date']),
                              style:
                                  const TextStyle(fontSize: 12, height: 1.5),
                            ),
                            trailing: Text(
                              '+${double.tryParse(referral['amount'].toString())?.toStringAsFixed(0) ?? '0'}',
                              style: const TextStyle(
                                color: AppTheme.successGreen,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                        )),

                  const SizedBox(height: 32),

                  // Apply Code Section
                  const Text(
                    'Got a Referral Code?',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Enter a friend\'s code below to unlock rewards.',
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: isDark ? AppTheme.darkSurface : Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color:
                            isDark ? AppTheme.darkDivider : Colors.grey[300]!,
                      ),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _codeController,
                            decoration: const InputDecoration(
                              hintText: 'Enter code here',
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              contentPadding:
                                  EdgeInsets.symmetric(horizontal: 16),
                              fillColor: Colors.transparent,
                            ),
                            textCapitalization: TextCapitalization.characters,
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, letterSpacing: 1),
                          ),
                        ),
                        ElevatedButton(
                          onPressed: _isApplying ? null : _applyCode,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryColor,
                            foregroundColor: Colors.black,
                            minimumSize: const Size(100, 48),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: _isApplying
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: Colors.black))
                              : const Text('APPLY',
                                  style:
                                      TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.darkDivider : Colors.grey[200]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppTheme.primaryColor, size: 24),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
          ),
        ],
      ),
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


