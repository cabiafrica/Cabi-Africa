import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class WelfareSchemeScreen extends ConsumerStatefulWidget {
  const WelfareSchemeScreen({super.key});

  @override
  ConsumerState<WelfareSchemeScreen> createState() => _WelfareSchemeScreenState();
}

class _WelfareSchemeScreenState extends ConsumerState<WelfareSchemeScreen> {
  bool _isLoading = true;
  List<dynamic> _schemes = [];
  List<dynamic> _summaries = [];
  String? _error;

  final String _baseUrl = 'http://localhost:3334/api/welfare'; // Update with actual API URL

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final authState = ref.read(authProvider);
    if (authState is! Authenticated) return;

    final driverId = authState.user!['driverProfile']['id'];

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // 1. Fetch all active schemes
      final schemesRes = await http.get(Uri.parse('$_baseUrl/schemes/active'));
      final schemesData = jsonDecode(schemesRes.body);

      // 2. Fetch driver's contribution summary
      final summaryRes = await http.get(Uri.parse('$_baseUrl/summary/$driverId'));
      final summaryData = jsonDecode(summaryRes.body);

      if (mounted) {
        setState(() {
          _schemes = schemesData['data'] ?? [];
          _summaries = summaryData['data'] ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load welfare information: $e';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _toggleEnrollment(dynamic scheme, bool enroll, {double? amount}) async {
    final authState = ref.read(authProvider);
    final driverId = authState is Authenticated ? authState.user!['driverProfile']['id'] : '';

    try {
      if (enroll) {
        await http.post(
          Uri.parse('$_baseUrl/enroll'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'driverProfileId': driverId,
            'schemeId': scheme['id'],
            'customAmount': amount,
          }),
        );
      } else {
        await http.delete(Uri.parse('$_baseUrl/enroll/$driverId/${scheme['id']}'));
      }
      _fetchData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Operation failed: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _showHousingAmountDialog(dynamic scheme) {
    final controller = TextEditingController(text: scheme['amount'].toString());
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppTheme.darkBackground,
        title: const Text('Housing Contribution', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Set your daily contribution target (KSH):',
              style: TextStyle(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.05),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                hintText: 'e.g. 300',
                prefixText: 'KSH ',
                prefixStyle: const TextStyle(color: AppTheme.primaryColor),
              ),
            ),
            if (scheme['minAmount'] != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  'Min: KSH ${scheme['minAmount']} • Max: KSH ${scheme['maxAmount']}',
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('CANCEL'),
          ),
          ElevatedButton(
            onPressed: () {
              final amount = double.tryParse(controller.text);
              if (amount != null) {
                Navigator.pop(context);
                _toggleEnrollment(scheme, true, amount: amount);
              }
            },
            child: const Text('ENROLL'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBackground,
      appBar: AppBar(
        title: const Text('DRIVER WELFARE', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
              : RefreshIndicator(
                  onRefresh: _fetchData,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSummarySection(),
                        const SizedBox(height: 32),
                        const Text(
                          'AVAILABLE SCHEMES',
                          style: TextStyle(color: Colors.white54, fontWeight: FontWeight.bold, letterSpacing: 1.5, fontSize: 12),
                        ),
                        const SizedBox(height: 16),
                        ..._schemes.map((s) => _buildSchemeCard(s)),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildSummarySection() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryColor, AppTheme.primaryColor.withValues(alpha: 0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: AppTheme.primaryColor.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 10)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('TOTAL WELFARE SAVINGS', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 8),
          Row(
            children: [
              const Text('KSH', style: TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(width: 8),
              Text(
                _summaries.fold(0.0, (sum, item) => sum + (item['totalContributed'] as num)).toStringAsFixed(2),
                style: const TextStyle(color: Colors.black, fontSize: 36, fontWeight: FontWeight.w900),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: _summaries.map((s) => _buildSmallStat(s['schemeType'], (s['totalContributed'] as num).toDouble())).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSmallStat(String type, double amount) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(type, style: const TextStyle(color: Colors.black54, fontSize: 10, fontWeight: FontWeight.bold)),
        Text('KSH ${amount.toStringAsFixed(0)}', style: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildSchemeCard(dynamic scheme) {
    final summary = _summaries.firstWhere((s) => s['schemeId'] == scheme['id'], orElse: () => null);
    final bool isEnrolled = summary != null && summary['isActive'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isEnrolled ? AppTheme.primaryColor.withValues(alpha: 0.3) : Colors.white10),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: (scheme['type'] == 'PENSION' ? Colors.teal : Colors.blue).withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    scheme['type'] == 'PENSION' ? Icons.account_balance : Icons.home_work,
                    color: scheme['type'] == 'PENSION' ? Colors.teal : Colors.blue,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(scheme['name'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      Text(
                        scheme['type'] == 'PENSION' ? 'Pension • Per trip' : 'Housing • Per day',
                        style: const TextStyle(color: Colors.white54, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: isEnrolled,
                  activeThumbColor: AppTheme.primaryColor,
                  onChanged: (val) {
                    if (val) {
                      if (scheme['type'] == 'HOUSING') {
                        _showHousingAmountDialog(scheme);
                      } else {
                        _toggleEnrollment(scheme, true);
                      }
                    } else {
                      _toggleEnrollment(scheme, false);
                    }
                  },
                ),
              ],
            ),
            if (scheme['description'] != null) ...[
              const SizedBox(height: 12),
              Text(scheme['description'], style: const TextStyle(color: Colors.white38, fontSize: 12)),
            ],
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('DEDUCTION', style: TextStyle(color: Colors.white38, fontSize: 10)),
                    Text(
                      'KSH ${isEnrolled && summary['customAmount'] != null ? summary['customAmount'] : scheme['amount']}${scheme['type'] == 'PENSION' ? '/trip' : '/day'}',
                      style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                if (isEnrolled)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text('SAVED SO FAR', style: TextStyle(color: Colors.white38, fontSize: 10)),
                      Text(
                        'KSH ${summary['totalContributed'].toStringAsFixed(0)}',
                        style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
