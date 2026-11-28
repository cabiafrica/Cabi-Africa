import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class CorporateBillingSelector extends StatefulWidget {
  final double estimatedFare;
  final Function({
    required bool isCorporate,
    String? accountId,
    String? costCenterId,
    String? purpose,
  }) onChanged;

  const CorporateBillingSelector({
    super.key,
    required this.estimatedFare,
    required this.onChanged,
  });

  @override
  State<CorporateBillingSelector> createState() => _CorporateBillingSelectorState();
}

class _CorporateBillingSelectorState extends State<CorporateBillingSelector> {
  bool _isCorporate = false;
  bool _isLoading = false;
  List<Map<String, dynamic>> _accounts = [];
  Map<String, dynamic>? _selectedAccount;
  Map<String, dynamic>? _selectedCostCenter;
  final TextEditingController _purposeController = TextEditingController();

  static const Color _primaryGreen = Color(0xFF00A859);
  static const Color _darkCharcoal = Color(0xFF1E2022);
  static const Color _accentAmber = Color(0xFFFFB800);
  static const Color _lightBg = Color(0xFFF8F9FA);

  @override
  void initState() {
    super.initState();
    _fetchCorporateAccounts();
  }

  @override
  void dispose() {
    _purposeController.dispose();
    super.dispose();
  }

  Future<String?> _resolveAuthToken() async {
    try {
      const storage = FlutterSecureStorage();
      for (final key in const ['jwt_token', 'auth_token', 'access_token', 'driver_token']) {
        final token = await storage.read(key: key);
        if (token != null && token.isNotEmpty) return token;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<void> _fetchCorporateAccounts() async {
    setState(() => _isLoading = true);
    try {
      final token = await _resolveAuthToken();
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getString('user_id') ?? 'current_user';

      final response = await http.get(
        Uri.parse('${AppConfig.dispatchApiUrl}/corporate/accounts/user/$userId'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        if (data.isNotEmpty) {
          setState(() {
            _accounts = List<Map<String, dynamic>>.from(data);
            _selectedAccount = _accounts.first;
            final costCenters = _selectedAccount?['costCenters'] as List<dynamic>?;
            if (costCenters != null && costCenters.isNotEmpty) {
              _selectedCostCenter = Map<String, dynamic>.from(costCenters.first);
            }
          });
          _notifyChange();
          return;
        }
      }
    } catch (_) {
      // Fallback demo profile for local/offline testing
    }

    // Default corporate demo profile if server returns empty or offline
    if (mounted) {
      setState(() {
        _accounts = [
          {
            'id': 'corp_cabi_hq',
            'companyName': 'Cabi Africa HQ (Demo)',
            'billingEmail': 'finance@cabi.africa',
            'costCenters': [
              {
                'id': 'cc_ops',
                'name': 'Operations & Dispatch',
                'code': 'OPS-101',
                'monthlyBudget': 50000.0,
                'currentSpent': 18500.0,
              },
              {
                'id': 'cc_sales',
                'name': 'Sales & Field Reps',
                'code': 'SLS-204',
                'monthlyBudget': 35000.0,
                'currentSpent': 28200.0,
              },
              {
                'id': 'cc_exec',
                'name': 'Executive Travel',
                'code': 'EXE-001',
                'monthlyBudget': 100000.0,
                'currentSpent': 12000.0,
              },
            ]
          }
        ];
        _selectedAccount = _accounts.first;
        final costCenters = _selectedAccount?['costCenters'] as List<dynamic>?;
        if (costCenters != null && costCenters.isNotEmpty) {
          _selectedCostCenter = Map<String, dynamic>.from(costCenters.first);
        }
        _isLoading = false;
      });
      _notifyChange();
    }
  }

  void _notifyChange() {
    String? accId;
    String? ccId;
    String? purp;
    if (_isCorporate) {
      if (_selectedAccount != null) {
        accId = _selectedAccount!['id']?.toString();
      }
      if (_selectedCostCenter != null) {
        ccId = _selectedCostCenter!['id']?.toString();
      }
      purp = _purposeController.text.trim();
    }
    widget.onChanged(
      isCorporate: _isCorporate,
      accountId: accId,
      costCenterId: ccId,
      purpose: purp,
    );
  }

  double _getRemainingBudget() {
    if (_selectedCostCenter == null) return 0.0;
    final budget = (_selectedCostCenter!['monthlyBudget'] as num?)?.toDouble() ?? 0.0;
    final spent = (_selectedCostCenter!['currentSpent'] as num?)?.toDouble() ?? 0.0;
    return (budget - spent).clamp(0.0, double.infinity);
  }

  @override
  Widget build(BuildContext context) {
    final remainingBudget = _getRemainingBudget();
    final exceedsBudget = _isCorporate && widget.estimatedFare > (remainingBudget * 1.10); // 10% emergency buffer

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _lightBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: _isCorporate ? _primaryGreen.withOpacity(0.5) : Colors.grey.shade300,
          width: _isCorporate ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                _isCorporate ? Icons.business : Icons.person_outline,
                color: _isCorporate ? _primaryGreen : _darkCharcoal,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                _isCorporate ? 'Corporate Account Billing' : 'Personal Billing',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: _darkCharcoal,
                ),
              ),
              const Spacer(),
              Transform.scale(
                scale: 0.85,
                child: Switch(
                  value: _isCorporate,
                  activeColor: _primaryGreen,
                  onChanged: (val) {
                    setState(() => _isCorporate = val);
                    _notifyChange();
                  },
                ),
              ),
            ],
          ),

          if (_isCorporate) ...[
            const SizedBox(height: 10),
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(8.0),
                  child: CircularProgressIndicator(color: _primaryGreen, strokeWidth: 2),
                ),
              )
            else ...[
              // Company Indicator
              Row(
                children: [
                  const Icon(Icons.apartment, size: 16, color: Colors.grey),
                  const SizedBox(width: 6),
                  Text(
                    _selectedAccount?['companyName'] ?? 'Corporate Entity',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: _primaryGreen.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      '16% VAT Included',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: _primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Cost Center Dropdown
              const Text(
                'Department / Cost Center',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Colors.grey),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedCostCenter?['id'],
                    hint: const Text('Select Cost Center', style: TextStyle(fontSize: 13)),
                    items: (_selectedAccount?['costCenters'] as List<dynamic>? ?? []).map((cc) {
                      final item = Map<String, dynamic>.from(cc);
                      return DropdownMenuItem<String>(
                        value: item['id'],
                        child: Text(
                          '${item['name']} (${item['code']})',
                          style: const TextStyle(fontSize: 13),
                        ),
                      );
                    }).toList(),
                    onChanged: (newId) {
                      if (newId == null) return;
                      final costCenters = _selectedAccount?['costCenters'] as List<dynamic>? ?? [];
                      setState(() {
                        _selectedCostCenter = Map<String, dynamic>.from(
                          costCenters.firstWhere((cc) => cc['id'] == newId),
                        );
                      });
                      _notifyChange();
                    },
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // Quota progress indicator
              if (_selectedCostCenter != null) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Remaining Budget: KES ${remainingBudget.toStringAsFixed(0)}',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: exceedsBudget ? Colors.red : Colors.grey.shade700,
                      ),
                    ),
                    Text(
                      'Trip: KES ${widget.estimatedFare.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: (_selectedCostCenter!['monthlyBudget'] as num?)?.toDouble() != 0
                        ? (((_selectedCostCenter!['currentSpent'] as num?)?.toDouble() ?? 0) /
                                ((_selectedCostCenter!['monthlyBudget'] as num?)?.toDouble() ?? 1))
                            .clamp(0.0, 1.0)
                        : 0.0,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      exceedsBudget ? Colors.red : _primaryGreen,
                    ),
                    minHeight: 4,
                  ),
                ),
              ],

              // Exceeds warning
              if (exceedsBudget) ...[
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.warning_amber_rounded, size: 14, color: Colors.red),
                      SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          'Estimated fare exceeds cost-center limit (+10% buffer). Will automatically fallback to personal payment.',
                          style: TextStyle(fontSize: 10, color: Colors.red),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 10),

              // Business Travel Purpose Input
              TextField(
                controller: _purposeController,
                style: const TextStyle(fontSize: 13),
                decoration: InputDecoration(
                  isDense: true,
                  hintText: 'Business purpose (e.g. Client meeting, Site inspection)',
                  hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: BorderSide(color: Colors.grey.shade300),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
                onChanged: (_) => _notifyChange(),
              ),
            ],
          ],
        ],
      ),
    );
  }
}
