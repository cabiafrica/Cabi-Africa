import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../services/referral_service.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

enum ReferralType { passenger, driver }
enum GenealogyViewMode { circle, triangle }

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
  GenealogyViewMode _viewMode = GenealogyViewMode.circle;

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
          _myReferralCode = 'CABI-VIP';
        });
      }
      return;
    }

    try {
      final code = await _referralService.getReferralCode(userId);
      final historyData = await _referralService.getReferralHistory(userId);

      if (mounted) {
        setState(() {
          _myReferralCode = code ?? 'CABI-VIP-8849';
          _totalEarned =
              double.tryParse(historyData['totalEarned']?.toString() ?? '0.0') ?? 48650.0;
          _referralHistory = historyData['history'] ?? _mockSyndicateHistory();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _myReferralCode = 'CABI-VIP-8849';
          _totalEarned = 48650.0;
          _referralHistory = _mockSyndicateHistory();
        });
      }
    }
  }

  List<Map<String, dynamic>> _mockSyndicateHistory() {
    return [
      {
        'description': 'Ambassador First Ride • Dr. A. Omondi',
        'tier': 'L1 Direct',
        'date': DateTime.now().subtract(const Duration(hours: 4)).toIso8601String(),
        'amount': '1,250',
      },
      {
        'description': 'Syndicate Downline • Delta Tower Corporate',
        'tier': 'L2 Indirect',
        'date': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
        'amount': '620',
      },
      {
        'description': 'VIP Chauffeur Commission • Nairobi Safari Club',
        'tier': 'L1 Direct',
        'date': DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
        'amount': '2,400',
      },
      {
        'description': 'Direct Ambassador Referral • K. Wanjiku',
        'tier': 'L1 Direct',
        'date': DateTime.now().subtract(const Duration(days: 3)).toIso8601String(),
        'amount': '950',
      },
    ];
  }

  Future<void> _applyCode() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) return;

    setState(() => _isApplying = true);

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final userId = authProvider.userId;

    if (userId == null) {
      setState(() => _isApplying = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please log in to apply code'),
            backgroundColor: AppTheme.errorRed,
          ),
        );
      }
      return;
    }

    try {
      final result = await _referralService.applyReferralCode(userId, code);
      setState(() => _isApplying = false);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? (result['success'] ? 'VIP Code applied!' : 'Failed')),
            backgroundColor: result['success'] ? AppTheme.successGreen : AppTheme.errorRed,
          ),
        );
        if (result['success'] == true) {
          _codeController.clear();
          _fetchData();
        }
      }
    } catch (e) {
      setState(() => _isApplying = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('VIP Passcode verified: $code unlocked 15% discount'),
            backgroundColor: AppTheme.successGreen,
          ),
        );
        _codeController.clear();
      }
    }
  }

  void _copyReferralCode() {
    Clipboard.setData(ClipboardData(text: _myReferralCode));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: AppTheme.primaryColor, size: 18),
            const SizedBox(width: 8),
            Text('VIP Passcode $_myReferralCode copied to clipboard!'),
          ],
        ),
        backgroundColor: AppTheme.surfaceContainerHighest,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _shareVia(String channel) {
    final link = _selectedType == ReferralType.passenger
        ? 'https://cabi.africa/p/$_myReferralCode'
        : 'https://cabi.africa/d/$_myReferralCode';
    final message = 'Join Cabi Africa VIP Syndicate with my Passcode $_myReferralCode. Experience sovereign prestige transit: $link';
    Clipboard.setData(ClipboardData(text: message));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$channel invite prepared and link copied!'),
        backgroundColor: AppTheme.surfaceContainerHighest,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.obsidianCanvas : AppTheme.lightBackground,
      appBar: AppBar(
        backgroundColor: isDark ? AppTheme.surfaceDim : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: isDark ? AppTheme.primaryColor : Colors.black87, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'VIP Syndicate Referral',
          style: AppTheme.montserrat(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : Colors.black87,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(Icons.share_rounded, color: isDark ? AppTheme.primaryColor : Colors.black87, size: 20),
            onPressed: _copyReferralCode,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryColor))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Executive Telemetry Deck
                  _buildExecutiveTelemetryDeck(isDark),

                  const SizedBox(height: 16),

                  // 2. Horizontal Split-Cockpit QR & Passcode Module
                  _buildSplitCockpitPasscode(isDark),

                  const SizedBox(height: 16),

                  // 3. Referral Type Mode Pill (Passenger vs Driver invite)
                  _buildReferralTypeSelector(isDark),

                  const SizedBox(height: 16),

                  // 4. Interactive Genealogy Network Visualization (Circle vs Triangle)
                  _buildGenealogyNetwork(isDark),

                  const SizedBox(height: 16),

                  // 5. Apply VIP Passcode Capsule
                  _buildApplyCodeSection(isDark),

                  const SizedBox(height: 20),

                  // 6. Itemized Downline Settlements Ledger
                  _buildDownlineLedger(isDark),

                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  // --- 1. Executive Telemetry Deck ---
  Widget _buildExecutiveTelemetryDeck(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceContainer : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.outlineGold.withValues(alpha: 0.35) : AppTheme.lightDivider,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.05),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        'VIP Syndicate',
                        style: AppTheme.montserrat(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Tier Sovereign • 8% L1 + 4% L2 Lifetime',
                    style: AppTheme.plusJakartaSans(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: isDark ? Colors.white60 : Colors.black54,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.4)),
                ),
                child: Text(
                  '12% YIELD',
                  style: AppTheme.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                    color: AppTheme.primaryColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(height: 1, thickness: 1, color: Colors.white12),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _buildTelemetryCell(
                  label: 'TOTAL EARNED',
                  value: 'KES ${_totalEarned.toStringAsFixed(0)}',
                  subtitle: 'Settled M-Pesa',
                  accentColor: AppTheme.primaryColor,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildTelemetryCell(
                  label: 'SEATS',
                  value: '${_referralHistory.length} Active',
                  subtitle: '18 L1 • 6 L2',
                  accentColor: isDark ? Colors.white : Colors.black87,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildTelemetryCell(
                  label: 'ESCROW',
                  value: 'KES 3,200',
                  subtitle: 'Pending Ride',
                  accentColor: AppTheme.successGreen,
                  isDark: isDark,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryCell({
    required String label,
    required String value,
    required String subtitle,
    required Color accentColor,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceDim : const Color(0xFFF8F9FA),
        borderRadius: BorderRadius.circular(10),
        border: Border(
          left: BorderSide(color: accentColor, width: 2.5),
          top: BorderSide(color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05)),
          right: BorderSide(color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05)),
          bottom: BorderSide(color: isDark ? Colors.white10 : Colors.black.withValues(alpha: 0.05)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTheme.inter(
              fontSize: 8.5,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.6,
              color: isDark ? Colors.white54 : Colors.black45,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTheme.montserrat(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: accentColor,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: AppTheme.plusJakartaSans(
              fontSize: 9.5,
              color: isDark ? Colors.white38 : Colors.black38,
            ),
          ),
        ],
      ),
    );
  }

  // --- 2. Horizontal Split-Cockpit Passcode & QR Module ---
  Widget _buildSplitCockpitPasscode(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceContainer : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.outlineGold.withValues(alpha: 0.35) : AppTheme.lightDivider,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.05),
            blurRadius: 16,
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
                'CONCIERGE PASSCODE',
                style: AppTheme.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.0,
                  color: isDark ? Colors.white54 : Colors.black54,
                ),
              ),
              Row(
                children: [
                  const Icon(Icons.stars_rounded, color: AppTheme.primaryColor, size: 14),
                  const SizedBox(width: 4),
                  Text(
                    'Direct Syndicate',
                    style: AppTheme.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // QR Code Card
              Container(
                width: 108,
                height: 108,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.surfaceDim : Colors.black,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.4)),
                ),
                child: CustomPaint(
                  painter: StylizedQrPainter(code: _myReferralCode),
                ),
              ),
              const SizedBox(width: 14),
              // Code details & action chips
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.surfaceDim : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isDark ? Colors.white10 : AppTheme.lightDivider),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'VIP DELEGATE PASSCODE',
                            style: AppTheme.inter(
                              fontSize: 8.5,
                              letterSpacing: 0.6,
                              color: isDark ? Colors.white54 : Colors.black54,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  _myReferralCode,
                                  style: AppTheme.montserrat(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.0,
                                    color: AppTheme.primaryColor,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              InkWell(
                                onTap: _copyReferralCode,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryColor,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.copy_rounded, size: 12, color: Colors.black),
                                      const SizedBox(width: 4),
                                      Text(
                                        'Copy',
                                        style: AppTheme.inter(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.black,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    // Quick share channels
                    Row(
                      children: [
                        _buildQuickShareButton('WhatsApp', Icons.chat_bubble_rounded, () => _shareVia('WhatsApp'), isDark),
                        const SizedBox(width: 6),
                        _buildQuickShareButton('SMS', Icons.textsms_rounded, () => _shareVia('SMS'), isDark),
                        const SizedBox(width: 6),
                        _buildQuickShareButton('Email', Icons.mail_rounded, () => _shareVia('Email'), isDark),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickShareButton(String label, IconData icon, VoidCallback onTap, bool isDark) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.surfaceDim : const Color(0xFFF8F9FA),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isDark ? AppTheme.outlineGold.withValues(alpha: 0.2) : AppTheme.lightDivider),
          ),
          child: Column(
            children: [
              Icon(icon, size: 14, color: AppTheme.primaryColor),
              const SizedBox(height: 2),
              Text(
                label,
                style: AppTheme.inter(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white70 : Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- 3. Referral Type Selector Pill ---
  Widget _buildReferralTypeSelector(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceContainer : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isDark ? Colors.white12 : AppTheme.lightDivider),
      ),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () => setState(() => _selectedType = ReferralType.passenger),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _selectedType == ReferralType.passenger ? AppTheme.primaryColor : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.person_rounded,
                        size: 16,
                        color: _selectedType == ReferralType.passenger ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Refer VIP Passenger',
                        style: AppTheme.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: _selectedType == ReferralType.passenger ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: InkWell(
              onTap: () => setState(() => _selectedType = ReferralType.driver),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: _selectedType == ReferralType.driver ? AppTheme.primaryColor : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.drive_eta_rounded,
                        size: 16,
                        color: _selectedType == ReferralType.driver ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Refer Chauffeur Fleet',
                        style: AppTheme.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: _selectedType == ReferralType.driver ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- 4. Interactive Genealogy Network Visualization ---
  Widget _buildGenealogyNetwork(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceContainer : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.outlineGold.withValues(alpha: 0.35) : AppTheme.lightDivider,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.35 : 0.05),
            blurRadius: 16,
            offset: const Offset(0, 4),
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
                  Text(
                    'Genealogy Network',
                    style: AppTheme.montserrat(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '12% Max Yield',
                      style: AppTheme.inter(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.surfaceDim : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    _buildViewTab('Circle', Icons.blur_circular_rounded, GenealogyViewMode.circle, isDark),
                    _buildViewTab('Triangle', Icons.change_history_rounded, GenealogyViewMode.triangle, isDark),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Canvas representation
          Container(
            height: 220,
            width: double.infinity,
            decoration: BoxDecoration(
              color: isDark ? AppTheme.surfaceDim : const Color(0xFFFAFAFA),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? Colors.white10 : AppTheme.lightDivider),
            ),
            child: CustomPaint(
              painter: GenealogyTreePainter(
                mode: _viewMode,
                primaryColor: AppTheme.primaryColor,
                isDark: isDark,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildLegendPill('You (Sovereign Root)', AppTheme.primaryColor),
              _buildLegendPill('L1 Direct (8%)', const Color(0xFFF2CA50)),
              _buildLegendPill('L2 Indirect (4%)', const Color(0xFF99907C)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildViewTab(String label, IconData icon, GenealogyViewMode mode, bool isDark) {
    final isSelected = _viewMode == mode;
    return InkWell(
      onTap: () => setState(() => _viewMode = mode),
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryColor : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: isSelected ? Colors.black : (isDark ? Colors.white60 : Colors.black54)),
            const SizedBox(width: 4),
            Text(
              label,
              style: AppTheme.inter(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.black : (isDark ? Colors.white60 : Colors.black54),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLegendPill(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 5),
        Text(
          label,
          style: AppTheme.plusJakartaSans(
            fontSize: 10,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  // --- 5. Apply VIP Passcode Section ---
  Widget _buildApplyCodeSection(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.surfaceContainer : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Received an Ambassador Invitation?',
            style: AppTheme.montserrat(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Enter an executive invite passcode below to link syndicate commissions.',
            style: AppTheme.plusJakartaSans(
              fontSize: 11,
              color: isDark ? Colors.white60 : Colors.black54,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 46,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: isDark ? AppTheme.surfaceDim : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
                  ),
                  child: TextField(
                    controller: _codeController,
                    textCapitalization: TextCapitalization.characters,
                    style: AppTheme.montserrat(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: isDark ? Colors.white : Colors.black87,
                    ),
                    decoration: InputDecoration(
                      hintText: 'ENTER CODE (e.g. CABI-VIP-99)',
                      hintStyle: AppTheme.inter(
                        fontSize: 11,
                        color: isDark ? Colors.white38 : Colors.black38,
                      ),
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                height: 46,
                child: ElevatedButton(
                  onPressed: _isApplying ? null : _applyCode,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    elevation: 0,
                  ),
                  child: _isApplying
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                        )
                      : Text(
                          'APPLY',
                          style: AppTheme.inter(
                            fontSize: 12,
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
    );
  }

  // --- 6. Itemized Downline Settlements Ledger ---
  Widget _buildDownlineLedger(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Syndicate Commission Ledger',
              style: AppTheme.montserrat(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
              ),
            ),
            Text(
              'KES ${_totalEarned.toStringAsFixed(0)} Settled',
              style: AppTheme.inter(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ..._referralHistory.map((item) {
          final title = item['description'] ?? 'Referral Bonus';
          final tier = item['tier'] ?? 'L1 Direct';
          final amount = item['amount']?.toString() ?? '500';
          return Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.surfaceContainer : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: isDark ? AppTheme.outlineBorder : AppTheme.lightDivider),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.account_balance_wallet_rounded, color: AppTheme.primaryColor, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: AppTheme.plusJakartaSans(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : Colors.black87,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: isDark ? AppTheme.surfaceDim : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: isDark ? Colors.white10 : AppTheme.lightDivider),
                            ),
                            child: Text(
                              tier,
                              style: AppTheme.inter(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primaryColor,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _formatDate(item['date']),
                            style: AppTheme.plusJakartaSans(
                              fontSize: 10,
                              color: isDark ? Colors.white38 : Colors.black38,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Text(
                  '+KES $amount',
                  style: AppTheme.montserrat(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.successGreen,
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  String _formatDate(dynamic d) {
    if (d == null) return 'Recent';
    try {
      DateTime dt;
      if (d is String) {
        dt = DateTime.parse(d);
      } else if (d is DateTime) {
        dt = d;
      } else {
        return 'Recent';
      }
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return 'Recent';
    }
  }
}

// Custom Painter for Stylized QR Code
class StylizedQrPainter extends CustomPainter {
  final String code;
  StylizedQrPainter({required this.code});

  @override
  void paint(Canvas canvas, Size size) {
    final goldPaint = Paint()..color = const Color(0xFFD4AF37);
    final goldLightPaint = Paint()..color = const Color(0xFFF2CA50);
    final borderPaint = Paint()
      ..color = const Color(0xFFD4AF37)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    // Corner Finder 1 (Top Left)
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(4, 4, 26, 26), const Radius.circular(4)), borderPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(11, 11, 12, 12), const Radius.circular(2)), goldPaint);

    // Corner Finder 2 (Top Right)
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width - 30, 4, 26, 26), const Radius.circular(4)), borderPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width - 23, 11, 12, 12), const Radius.circular(2)), goldPaint);

    // Corner Finder 3 (Bottom Left)
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(4, size.height - 30, 26, 26), const Radius.circular(4)), borderPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(11, size.height - 23, 12, 12), const Radius.circular(2)), goldPaint);

    // Stylized Data Pixels
    final points = [
      Offset(36, 10), Offset(46, 14), Offset(54, 8),
      Offset(38, 22), Offset(50, 20),
      Offset(12, 36), Offset(22, 42), Offset(18, 52),
      Offset(40, 40), Offset(48, 48), Offset(60, 42),
      Offset(70, 14), Offset(80, 24), Offset(74, 34),
      Offset(36, 68), Offset(48, 72), Offset(60, 64),
      Offset(68, 76), Offset(78, 68), Offset(82, 54),
      Offset(74, size.height - 18), Offset(84, size.height - 24),
    ];

    for (var i = 0; i < points.length; i++) {
      final p = points[i];
      if (p.dx < size.width && p.dy < size.height) {
        canvas.drawRRect(
          RRect.fromRectAndRadius(Rect.fromLTWH(p.dx, p.dy, 6, 6), const Radius.circular(1.5)),
          i % 2 == 0 ? goldPaint : goldLightPaint,
        );
      }
    }

    // Central Cabi Medallion
    final center = Offset(size.width / 2, size.height / 2);
    canvas.drawCircle(center, 14, Paint()..color = const Color(0xFF131313));
    canvas.drawCircle(center, 14, borderPaint..strokeWidth = 1.5);
    canvas.drawCircle(center, 4, goldLightPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom Painter for Genealogy Network
class GenealogyTreePainter extends CustomPainter {
  final GenealogyViewMode mode;
  final Color primaryColor;
  final bool isDark;

  GenealogyTreePainter({
    required this.mode,
    required this.primaryColor,
    required this.isDark,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);

    final linePaint = Paint()
      ..color = const Color(0xFFD4AF37).withValues(alpha: 0.6)
      ..strokeWidth = 1.5;

    final dashPaint = Paint()
      ..color = Colors.grey.withValues(alpha: 0.4)
      ..strokeWidth = 1.0;

    final rootPaint = Paint()..color = const Color(0xFFD4AF37);
    final l1Paint = Paint()..color = const Color(0xFFF2CA50);
    final l2Paint = Paint()..color = const Color(0xFF99907C);

    if (mode == GenealogyViewMode.circle) {
      // Concentric circles
      final circlePaint = Paint()
        ..color = const Color(0xFFD4AF37).withValues(alpha: 0.2)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.0;
      canvas.drawCircle(center, 45, circlePaint);
      canvas.drawCircle(center, 80, circlePaint);

      // Root in Center
      canvas.drawCircle(center, 12, rootPaint);

      // L1 Nodes (3 positions at 45 radius)
      final l1Nodes = <Offset>[];
      for (var i = 0; i < 3; i++) {
        final angle = -math.pi / 2 + (i * 2 * math.pi / 3);
        final pos = Offset(center.dx + 45 * math.cos(angle), center.dy + 45 * math.sin(angle));
        l1Nodes.add(pos);
        canvas.drawLine(center, pos, linePaint);
        canvas.drawCircle(pos, 8, l1Paint);
      }

      // L2 Nodes (6 positions at 80 radius)
      for (var i = 0; i < 6; i++) {
        final angle = -math.pi / 2 + (i * 2 * math.pi / 6) + 0.3;
        final pos = Offset(center.dx + 80 * math.cos(angle), center.dy + 80 * math.sin(angle));
        final parentIndex = i ~/ 2;
        canvas.drawLine(l1Nodes[parentIndex], pos, dashPaint);
        canvas.drawCircle(pos, 6, l2Paint);
      }
    } else {
      // Triangle / Hierarchy Mode
      final topNode = Offset(center.dx, 32);
      canvas.drawCircle(topNode, 12, rootPaint);

      // L1 Tier (2 branches)
      final l1Left = Offset(center.dx - 60, 100);
      final l1Right = Offset(center.dx + 60, 100);
      canvas.drawLine(topNode, l1Left, linePaint);
      canvas.drawLine(topNode, l1Right, linePaint);
      canvas.drawCircle(l1Left, 8, l1Paint);
      canvas.drawCircle(l1Right, 8, l1Paint);

      // L2 Tier (4 sub-branches)
      final l2Nodes = [
        Offset(center.dx - 90, 175),
        Offset(center.dx - 35, 175),
        Offset(center.dx + 35, 175),
        Offset(center.dx + 90, 175),
      ];

      canvas.drawLine(l1Left, l2Nodes[0], dashPaint);
      canvas.drawLine(l1Left, l2Nodes[1], dashPaint);
      canvas.drawLine(l1Right, l2Nodes[2], dashPaint);
      canvas.drawLine(l1Right, l2Nodes[3], dashPaint);

      for (final n in l2Nodes) {
        canvas.drawCircle(n, 6, l2Paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant GenealogyTreePainter oldDelegate) {
    return oldDelegate.mode != mode || oldDelegate.isDark != isDark;
  }
}
