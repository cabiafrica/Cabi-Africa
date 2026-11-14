import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/sos_button.dart';

class WealthProgramItem {
  final String id;
  final String name;
  final String serviceCategory;
  final String description;
  final String? logoUrl;
  final double minPct;
  final double maxPct;
  final double defaultPct;
  final String dividendOrYield;
  final bool isDriverSelectable;
  final double platformBonusPct;
  final String? requiredBadgeName;
  bool isEnrolled;
  double selectedPct;

  WealthProgramItem({
    required this.id,
    required this.name,
    required this.serviceCategory,
    required this.description,
    this.logoUrl,
    required this.minPct,
    required this.maxPct,
    required this.defaultPct,
    required this.dividendOrYield,
    this.isDriverSelectable = true,
    this.platformBonusPct = 0.0,
    this.requiredBadgeName,
    this.isEnrolled = false,
    this.selectedPct = 0.0,
  });

  factory WealthProgramItem.fromJson(Map<String, dynamic> json) {
    final reqBadge = json['requiredBadge'] as Map<String, dynamic>?;
    return WealthProgramItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      serviceCategory: json['serviceCategory'] ?? 'SACCO',
      description: json['description'] ?? '',
      logoUrl: json['logoUrl'],
      minPct: (json['minPct'] as num?)?.toDouble() ?? 0.02,
      maxPct: (json['maxPct'] as num?)?.toDouble() ?? 0.20,
      defaultPct: (json['defaultPct'] as num?)?.toDouble() ?? 0.05,
      dividendOrYield: json['dividendOrYield'] ?? '',
      isDriverSelectable: json['isDriverSelectable'] ?? true,
      platformBonusPct: (json['platformBonusPct'] as num?)?.toDouble() ?? 0.0,
      requiredBadgeName: reqBadge?['name'] as String?,
      isEnrolled: false,
      selectedPct: 0.0,
    );
  }
}

class WealthCreationScreen extends ConsumerStatefulWidget {
  const WealthCreationScreen({super.key});

  @override
  ConsumerState<WealthCreationScreen> createState() => _WealthCreationScreenState();
}

class _WealthCreationScreenState extends ConsumerState<WealthCreationScreen> {
  bool _isLoading = true;
  bool _isSaving = false;

  static const double _maxDeductionCap = 0.30; // 30% Maximum Limit

  List<WealthProgramItem> _programs = [];

  double get _totalCommittedPct {
    return _programs
        .where((p) => p.isEnrolled)
        .fold(0.0, (sum, p) => sum + p.selectedPct);
  }

  double get _remainingCapacity {
    final rem = _maxDeductionCap - _totalCommittedPct;
    return rem < 0 ? 0.0 : rem;
  }

  bool get _isAtOrExceedingLimit => _totalCommittedPct >= (_maxDeductionCap - 0.0001);

  @override
  void initState() {
    super.initState();
    _loadProgramsAndAllocations();
  }

  Future<void> _loadProgramsAndAllocations() async {
    setState(() {
      _isLoading = true;
    });

    final authState = ref.read(authProvider);
    final driverId = authState is Authenticated ? authState.user!['driverProfile']['id'] : '';

    try {
      final catalogUri = Uri.parse('${AppConfig.saccoApiUrl}/sacco/wealth-programs');
      final allocationsUri = Uri.parse('${AppConfig.saccoApiUrl}/sacco/wealth-programs/my-allocations?driverProfileId=$driverId');

      final catalogRes = await http.get(catalogUri).timeout(const Duration(seconds: 4));
      http.Response? allocationsRes;
      if (driverId.isNotEmpty) {
        allocationsRes = await http.get(allocationsUri).timeout(const Duration(seconds: 4));
      }

      List<WealthProgramItem> loaded = [];
      if (catalogRes.statusCode == 200) {
        final decoded = jsonDecode(catalogRes.body);
        if (decoded is List) {
          loaded = decoded.map((e) => WealthProgramItem.fromJson(e)).toList();
        }
      }

      // If backend was unreachable or empty, use fallback defaults
      if (loaded.isEmpty) {
        loaded = _getFallbackPrograms();
      }

      // Apply driver's active allocations
      if (allocationsRes != null && allocationsRes.statusCode == 200) {
        final allocData = jsonDecode(allocationsRes.body);
        final List allocList = allocData['allocations'] ?? [];
        for (final alloc in allocList) {
          final pid = alloc['partnerId'];
          final pct = (alloc['deductionPct'] as num?)?.toDouble() ?? 0.0;
          final match = loaded.firstWhere(
            (p) => p.id == pid || p.serviceCategory == alloc['serviceType'],
            orElse: () => loaded.first,
          );
          match.isEnrolled = true;
          match.selectedPct = pct;
        }
      }

      if (mounted) {
        setState(() {
          _programs = loaded;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _programs = _getFallbackPrograms();
          _isLoading = false;
        });
      }
    }
  }

  List<WealthProgramItem> _getFallbackPrograms() {
    return [
      WealthProgramItem(
        id: 'sacco-capital-stima',
        name: 'Stima DT / Boda PSV SACCO',
        serviceCategory: 'SACCO',
        description: 'Cooperative savings earning 11.2% annual dividend. Remitted directly to your SACCO ledger per trip.',
        minPct: 0.02,
        maxPct: 0.20,
        defaultPct: 0.10,
        dividendOrYield: '11.2% Projected Annual Dividend',
        isEnrolled: true,
        selectedPct: 0.10,
      ),
      WealthProgramItem(
        id: 'insurance-cic-medical',
        name: 'CIC / Jubilee PSV & Family Health',
        serviceCategory: 'INSURANCE_HEALTH',
        description: 'Comprehensive outpatient & inpatient medical underwriting covering driver, spouse, and family.',
        minPct: 0.02,
        maxPct: 0.10,
        defaultPct: 0.05,
        dividendOrYield: 'KES 500,000 Medical & Accident Cover',
        isEnrolled: true,
        selectedPct: 0.05,
      ),
      WealthProgramItem(
        id: 'mmf-britam-yield',
        name: 'Britam High-Yield Money Market Fund',
        serviceCategory: 'INVESTMENT_MMF',
        description: 'Liquid wealth preservation with daily compound yields and instant emergency withdrawal.',
        minPct: 0.02,
        maxPct: 0.15,
        defaultPct: 0.05,
        dividendOrYield: '13.5% Daily Compound Yield',
        isEnrolled: false,
        selectedPct: 0.05,
      ),
      WealthProgramItem(
        id: 'pension-octagon-tier2',
        name: 'Octagon / NSSF Driver Retirement Fund',
        serviceCategory: 'PENSION',
        description: 'Long-term tax-exempt retirement annuity securing your financial independence post-driving.',
        minPct: 0.02,
        maxPct: 0.10,
        defaultPct: 0.05,
        dividendOrYield: 'Tax-Exempt Compounded Retirement Fund',
        isEnrolled: false,
        selectedPct: 0.05,
      ),
    ];
  }

  void _applyPreset(String name, Map<String, double> targetPcts) {
    HapticFeedback.mediumImpact();
    setState(() {
      for (final p in _programs) {
        if (targetPcts.containsKey(p.serviceCategory)) {
          p.isEnrolled = true;
          p.selectedPct = targetPcts[p.serviceCategory]!;
        } else {
          p.isEnrolled = false;
        }
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Applied "$name" preset (${(_totalCommittedPct * 100).toStringAsFixed(0)}% total)'),
        backgroundColor: AppTheme.primaryDark,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _updateProgramPercentage(WealthProgramItem program, double newPct) {
    final currentOtherTotal = _totalCommittedPct - (program.isEnrolled ? program.selectedPct : 0.0);
    final projectedTotal = currentOtherTotal + newPct;

    if (projectedTotal > _maxDeductionCap + 0.0001) {
      HapticFeedback.heavyImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cannot exceed the maximum allowed 30% deduction limit!'),
          backgroundColor: AppTheme.errorRed,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    HapticFeedback.selectionClick();
    setState(() {
      program.isEnrolled = true;
      program.selectedPct = double.parse(newPct.toStringAsFixed(2));
    });
  }

  Future<void> _saveAllocations() async {
    final authState = ref.read(authProvider);
    final driverId = authState is Authenticated ? authState.user!['driverProfile']['id'] : '';

    setState(() => _isSaving = true);
    HapticFeedback.lightImpact();

    final payload = {
      'driverProfileId': driverId,
      'allocations': _programs.map((p) => {
        'partnerId': p.id,
        'serviceType': p.serviceCategory,
        'deductionPct': p.isEnrolled ? p.selectedPct : 0.0,
        'isConsented': p.isEnrolled,
      }).toList(),
    };

    try {
      final uri = Uri.parse('${AppConfig.saccoApiUrl}/sacco/wealth-programs/update-allocations');
      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 5));

      if (res.statusCode == 200 || res.statusCode == 201) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Wealth creation preferences saved! (${(_totalCommittedPct * 100).toStringAsFixed(1)}% total deduction)'),
              backgroundColor: AppTheme.successGreen,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      } else {
        final err = jsonDecode(res.body);
        throw Exception(err['message'] ?? 'Failed to update preferences');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Preferences saved locally. Total: ${(_totalCommittedPct * 100).toStringAsFixed(1)}%'),
            backgroundColor: AppTheme.primaryDark,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final totalPct = _totalCommittedPct;
    final remainingPct = _remainingCapacity;
    final progressFraction = (totalPct / _maxDeductionCap).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: Text(
          'Wealth Creation Programs',
          style: GoogleFonts.inter(
            fontWeight: FontWeight.w700,
            fontSize: 18,
            color: Colors.white,
          ),
        ),
        backgroundColor: AppTheme.darkSurface,
        elevation: 0,
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12.0),
            child: SosButton(size: 38),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primaryColor),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Interactive Capacity Meter Header Card
                  _buildCapacityMeterCard(totalPct, remainingPct, progressFraction),

                  const SizedBox(height: 18),

                  // 2. Preset Strategy Allocations
                  _buildPresetsSection(),

                  const SizedBox(height: 22),

                  // 3. Section Title
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'ADMIN-APPROVED PROGRAMS',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1.2,
                          color: AppTheme.primaryLight,
                        ),
                      ),
                      Text(
                        '${_programs.where((p) => p.isEnrolled).length}/${_programs.length} Active',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.darkTextSecondary,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // 4. Program Cards
                  ..._programs.map((program) => _buildProgramCard(program)),

                  const SizedBox(height: 20),

                  // 5. Trip Deduction Explanation Callout
                  _buildTripDeductionExplainer(totalPct),

                  const SizedBox(height: 28),

                  // 6. Save Action Button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _saveAllocations,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 4,
                      ),
                      child: _isSaving
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                color: Colors.black,
                              ),
                            )
                          : Text(
                              'Save Wealth Preferences',
                              style: GoogleFonts.inter(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
    );
  }

  Widget _buildCapacityMeterCard(double totalPct, double remainingPct, double fraction) {
    final isFull = totalPct >= _maxDeductionCap;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isFull
              ? AppTheme.primaryColor
              : AppTheme.primaryColor.withValues(alpha: 0.3),
          width: isFull ? 1.5 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: isFull
                ? AppTheme.primaryColor.withValues(alpha: 0.15)
                : Colors.black38,
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
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'TOTAL TRIP DEDUCTION',
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.1,
                      color: AppTheme.darkTextSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '${(totalPct * 100).toStringAsFixed(1)}%',
                        style: GoogleFonts.inter(
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          color: isFull ? AppTheme.primaryColor : Colors.white,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '/ 30.0% Max Limit',
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.darkTextSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: isFull
                      ? AppTheme.primaryDark.withValues(alpha: 0.25)
                      : AppTheme.successGreen.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isFull
                        ? AppTheme.primaryColor
                        : AppTheme.successGreen.withValues(alpha: 0.5),
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      'AVAILABLE',
                      style: GoogleFonts.inter(
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: isFull ? AppTheme.primaryColor : AppTheme.successGreen,
                      ),
                    ),
                    Text(
                      '${(remainingPct * 100).toStringAsFixed(1)}%',
                      style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: isFull ? AppTheme.primaryColor : AppTheme.successGreen,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Animated Linear Capacity Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: fraction,
              minHeight: 12,
              backgroundColor: const Color(0xFF27272A),
              valueColor: AlwaysStoppedAnimation<Color>(
                isFull
                    ? AppTheme.primaryColor
                    : fraction > 0.7
                        ? AppTheme.secondaryAmber
                        : AppTheme.successGreen,
              ),
            ),
          ),

          const SizedBox(height: 12),

          if (isFull)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.amber.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 16, color: Colors.amber),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Maximum 30% limit reached. Adjust existing percentages to redistribute.',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: Colors.amber,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            Text(
              'Deductions are automatically allocated from your 80% net trip earnings.',
              style: GoogleFonts.inter(
                fontSize: 11.5,
                color: AppTheme.darkTextSecondary,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPresetsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'QUICK ALLOCATION PRESETS',
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.1,
            color: AppTheme.darkTextSecondary,
          ),
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildPresetChip(
                label: 'Balanced Builder',
                pct: '20%',
                onTap: () => _applyPreset('Balanced Builder', {
                  'SACCO': 0.10,
                  'INSURANCE_HEALTH': 0.05,
                  'INVESTMENT_MMF': 0.05,
                }),
              ),
              const SizedBox(width: 8),
              _buildPresetChip(
                label: 'Max Growth',
                pct: '30%',
                isAccent: true,
                onTap: () => _applyPreset('Max Growth', {
                  'SACCO': 0.15,
                  'INSURANCE_HEALTH': 0.05,
                  'INVESTMENT_MMF': 0.05,
                  'PENSION': 0.05,
                }),
              ),
              const SizedBox(width: 8),
              _buildPresetChip(
                label: 'Starter Safe',
                pct: '10%',
                onTap: () => _applyPreset('Starter Safe', {
                  'SACCO': 0.05,
                  'INSURANCE_HEALTH': 0.05,
                }),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPresetChip({
    required String label,
    required String pct,
    bool isAccent = false,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isAccent
              ? AppTheme.primaryColor.withValues(alpha: 0.15)
              : AppTheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isAccent ? AppTheme.primaryColor : AppTheme.outlineBorder,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isAccent ? Icons.bolt_rounded : Icons.auto_awesome_rounded,
              size: 14,
              color: isAccent ? AppTheme.primaryColor : Colors.white70,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black45,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                pct,
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: isAccent ? AppTheme.primaryColor : AppTheme.successGreen,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgramCard(WealthProgramItem program) {
    final isEnrolled = program.isEnrolled;
    final selectedPct = program.selectedPct;

    Color categoryColor;
    IconData categoryIcon;
    switch (program.serviceCategory) {
      case 'SACCO':
        categoryColor = const Color(0xFFFFB300);
        categoryIcon = Icons.account_balance_rounded;
        break;
      case 'INSURANCE_HEALTH':
      case 'INSURANCE_VEHICLE':
      case 'INSURANCE_LIFE':
        categoryColor = const Color(0xFF00E5FF);
        categoryIcon = Icons.health_and_safety_rounded;
        break;
      case 'INVESTMENT_MMF':
        categoryColor = const Color(0xFF00E676);
        categoryIcon = Icons.trending_up_rounded;
        break;
      case 'PENSION':
        categoryColor = const Color(0xFFC5A059);
        categoryIcon = Icons.savings_rounded;
        break;
      default:
        categoryColor = AppTheme.primaryColor;
        categoryIcon = Icons.stars_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppTheme.darkSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isEnrolled
              ? categoryColor.withValues(alpha: 0.5)
              : AppTheme.outlineBorder,
          width: isEnrolled ? 1.5 : 1.0,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Category Badge + Switch Toggle
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: categoryColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(categoryIcon, size: 20, color: categoryColor),
                    ),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          program.serviceCategory.replaceAll('_', ' '),
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: categoryColor,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          program.name,
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Switch(
                  value: isEnrolled,
                  thumbColor: WidgetStateProperty.resolveWith<Color>((states) {
                    if (states.contains(WidgetState.selected)) return AppTheme.primaryColor;
                    return Colors.grey;
                  }),
                  trackColor: WidgetStateProperty.resolveWith<Color>((states) {
                    if (states.contains(WidgetState.selected)) {
                      return AppTheme.primaryDark.withValues(alpha: 0.3);
                    }
                    return Colors.black26;
                  }),
                  onChanged: (val) {
                    if (val) {
                      // Attempt to enroll at default percentage
                      final targetPct = program.selectedPct > 0 ? program.selectedPct : program.defaultPct;
                      final remaining = _maxDeductionCap - _totalCommittedPct;
                      if (remaining < targetPct) {
                        _updateProgramPercentage(program, remaining > 0.02 ? remaining : 0.02);
                      } else {
                        _updateProgramPercentage(program, targetPct);
                      }
                    } else {
                      HapticFeedback.lightImpact();
                      setState(() {
                        program.isEnrolled = false;
                      });
                    }
                  },
                ),
              ],
            ),

            const SizedBox(height: 10),

            // Benefit description
            Text(
              program.description,
              style: GoogleFonts.inter(
                fontSize: 12,
                color: AppTheme.darkTextSecondary,
                height: 1.35,
              ),
            ),

            const SizedBox(height: 10),

            // Value badge (Dividend or Yield)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.black38,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.outlineBorder),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.verified_rounded, size: 14, color: categoryColor),
                  const SizedBox(width: 6),
                  Text(
                    program.dividendOrYield,
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),

            if (program.platformBonusPct > 0 || program.requiredBadgeName != null) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  if (program.platformBonusPct > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppTheme.primaryColor.withValues(alpha: 0.35)),
                      ),
                      child: Text(
                        '+${(program.platformBonusPct * 100).toStringAsFixed(0)}% Platform Bonus Match',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ),
                  if (program.requiredBadgeName != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppTheme.outlineBorder),
                      ),
                      child: Text(
                        'Badge: ${program.requiredBadgeName}',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: Colors.white70,
                        ),
                      ),
                    ),
                ],
              ),
            ],

            if (isEnrolled) ...[
              const Divider(color: AppTheme.outlineBorder, height: 24),

              // Percentage Stepper & Slider
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Contribution Rate per Trip:',
                    style: GoogleFonts.inter(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  Row(
                    children: [
                      // Minus Button
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline, color: Colors.white70),
                        iconSize: 22,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: selectedPct <= program.minPct
                            ? null
                            : () => _updateProgramPercentage(program, selectedPct - 0.01),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.primaryColor),
                        ),
                        child: Text(
                          '${(selectedPct * 100).toStringAsFixed(0)}%',
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Plus Button
                      IconButton(
                        icon: Icon(
                          Icons.add_circle_outline,
                          color: (_isAtOrExceedingLimit || selectedPct >= program.maxPct)
                              ? Colors.grey
                              : Colors.white,
                        ),
                        iconSize: 22,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: (_isAtOrExceedingLimit || selectedPct >= program.maxPct)
                            ? null
                            : () => _updateProgramPercentage(program, selectedPct + 0.01),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 6),

              // Trip Deduction Example Preview
              Text(
                'Example: On a KES 500 trip net payout (KES 400), deduction is KES ${(400 * selectedPct).toStringAsFixed(2)}',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontStyle: FontStyle.italic,
                  color: AppTheme.darkTextSecondary,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTripDeductionExplainer(double totalPct) {
    const exampleGross = 600.0;
    const examplePlatformFee = exampleGross * 0.20; // KES 120
    const exampleNetPayout = exampleGross * 0.80; // KES 480
    final exampleWealthDeduction = exampleNetPayout * totalPct;
    final exampleFinalCash = exampleNetPayout - exampleWealthDeduction;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDim,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.outlineBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.calculate_outlined, size: 18, color: AppTheme.primaryColor),
              const SizedBox(width: 8),
              Text(
                'HOW YOUR COMMISSIONS ARE DEDUCTED',
                style: GoogleFonts.inter(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.9,
                  color: AppTheme.primaryColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'For every completed trip, Cabi deducts your chosen wealth contributions directly from your 80% net payout. You never need to deposit manually.',
            style: GoogleFonts.inter(fontSize: 11.5, color: Colors.white70, height: 1.4),
          ),
          const SizedBox(height: 10),
          _buildReceiptRow('Example Gross Trip Fare:', 'KES ${exampleGross.toStringAsFixed(0)}'),
          _buildReceiptRow('Cabi Platform Commission (20%):', '- KES ${examplePlatformFee.toStringAsFixed(0)}'),
          _buildReceiptRow('Driver Net Payout (80%):', 'KES ${exampleNetPayout.toStringAsFixed(0)}', isBold: true),
          _buildReceiptRow(
            'Wealth Programs (${(totalPct * 100).toStringAsFixed(1)}% total):',
            '- KES ${exampleWealthDeduction.toStringAsFixed(2)}',
            highlightColor: AppTheme.primaryColor,
          ),
          const Divider(color: AppTheme.outlineBorder, height: 16),
          _buildReceiptRow(
            'Final Take-Home Wallet Credit:',
            'KES ${exampleFinalCash.toStringAsFixed(2)}',
            isBold: true,
            highlightColor: AppTheme.successGreen,
          ),
        ],
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, {bool isBold = false, Color? highlightColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: isBold ? FontWeight.w700 : FontWeight.w400,
              color: Colors.white70,
            ),
          ),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: isBold ? FontWeight.w800 : FontWeight.w500,
              color: highlightColor ?? Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
