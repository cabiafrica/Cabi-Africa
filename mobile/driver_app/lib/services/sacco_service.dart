import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';

class SaccoTransaction {
  final String id;
  final double amount;
  final String type;
  final String date;
  final String? relatedTripId;

  SaccoTransaction({
    required this.id,
    required this.amount,
    required this.type,
    required this.date,
    this.relatedTripId,
  });

  factory SaccoTransaction.fromJson(Map<String, dynamic> json) {
    return SaccoTransaction(
      id: json['id']?.toString() ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      type: json['type']?.toString() ?? 'DEPOSIT',
      date: json['createdAt']?.toString() ?? json['date']?.toString() ?? '',
      relatedTripId: json['relatedTripId']?.toString(),
    );
  }
}

class DriverSaccoSummaryData {
  final String driverProfileId;
  final bool enrolled;
  final String saccoName;
  final String membershipNumber;
  final double totalSavings;
  final double availableWithdrawal;
  final double currentSavingsRate; // e.g. 2.0 (%)
  final bool isAutoSavingsEnabled;
  final double dailyWelfareContribution;
  final bool isWelfareEnabled;
  final double walletBufferThreshold; // -5000.0 (Option A)
  final bool joiningIncentiveActive;
  final double incentivePct; // 3.0 (%)
  final int recentTransactionsCount;

  DriverSaccoSummaryData({
    required this.driverProfileId,
    required this.enrolled,
    required this.saccoName,
    required this.membershipNumber,
    required this.totalSavings,
    required this.availableWithdrawal,
    required this.currentSavingsRate,
    required this.isAutoSavingsEnabled,
    required this.dailyWelfareContribution,
    required this.isWelfareEnabled,
    required this.walletBufferThreshold,
    required this.joiningIncentiveActive,
    required this.incentivePct,
    required this.recentTransactionsCount,
  });

  factory DriverSaccoSummaryData.fromJson(Map<String, dynamic> json) {
    final savings = double.tryParse(json['totalSavings']?.toString() ?? '0') ?? 0.0;
    return DriverSaccoSummaryData(
      driverProfileId: json['driverProfileId']?.toString() ?? '',
      enrolled: json['enrolled'] == true,
      saccoName: json['saccoName']?.toString() ?? 'CABI Sacco',
      membershipNumber: json['membershipNumber']?.toString() ?? 'SACCO-MEMBER',
      totalSavings: savings,
      availableWithdrawal: double.tryParse(json['availableWithdrawal']?.toString() ?? '') ?? (savings * 0.3),
      currentSavingsRate: double.tryParse(json['currentSavingsRate']?.toString() ?? '2') ?? 2.0,
      isAutoSavingsEnabled: json['isAutoSavingsEnabled'] != false,
      dailyWelfareContribution: double.tryParse(json['dailyWelfareContribution']?.toString() ?? '50') ?? 50.0,
      isWelfareEnabled: json['isWelfareEnabled'] != false,
      walletBufferThreshold: double.tryParse(json['walletBufferThreshold']?.toString() ?? '-5000') ?? -5000.0,
      joiningIncentiveActive: json['joiningIncentiveActive'] != false,
      incentivePct: double.tryParse(json['incentivePct']?.toString() ?? '3') ?? 3.0,
      recentTransactionsCount: int.tryParse(json['recentTransactionsCount']?.toString() ?? '0') ?? 0,
    );
  }
}

final saccoServiceProvider = Provider<SaccoService>((ref) => SaccoService());

class SaccoService {
  final http.Client _client;
  SaccoService({http.Client? client}) : _client = client ?? http.Client();
  String get baseUrl => AppConfig.saccoApiUrl;

  Future<Map<String, dynamic>> getSaccoHealth() async {
    try {
      final response = await _client.get(Uri.parse('$baseUrl/sacco/health'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'status': 'error', 'message': 'Service unreachable'};
    } catch (e) {
      return {'status': 'error', 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getSavingsBalance(String driverId) async {
    try {
      final summaryRes = await _client.get(
        Uri.parse('$baseUrl/sacco/driver/summary?driverId=$driverId'),
      );
      if (summaryRes.statusCode == 200) {
        final data = jsonDecode(summaryRes.body);
        if (data is Map<String, dynamic>) {
          return data;
        }
      }

      final legacyRes = await _client.get(
        Uri.parse('$baseUrl/sacco/balance?driverId=$driverId'),
      );
      if (legacyRes.statusCode == 200) {
        final parsed = jsonDecode(legacyRes.body);
        if (parsed is Map<String, dynamic>) {
          return parsed;
        }
        final amt = double.tryParse(parsed.toString()) ?? 0.0;
        return {
          'totalSavings': amt,
          'availableWithdrawal': amt * 0.3,
          'saccoName': 'CABI Sacco',
        };
      }
      return {'totalSavings': 0.0, 'availableWithdrawal': 0.0, 'saccoName': 'CABI Sacco'};
    } catch (e) {
      return {
        'totalSavings': 0.0,
        'availableWithdrawal': 0.0,
        'saccoName': 'CABI Sacco',
        'error': e.toString(),
      };
    }
  }

  Future<bool> updateSavingsSettings({
    required String driverId,
    required double savingsRate,
    bool isWelfareEnabled = true,
    bool isAutoSavingsEnabled = true,
    double dailyWelfareAmount = 50.0,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/sacco/driver/settings'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'driverId': driverId,
          'savingsRate': savingsRate,
          'isAutoSavingsEnabled': isAutoSavingsEnabled,
          'isWelfareEnabled': isWelfareEnabled,
          'dailyWelfareAmount': dailyWelfareAmount,
        }),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  Future<List<SaccoTransaction>> getTransactions(String driverId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/sacco/transactions?driverId=$driverId'),
      );
      if (response.statusCode == 200) {
        final dynamic data = jsonDecode(response.body);
        if (data is List) {
          return data.map((json) => SaccoTransaction.fromJson(json as Map<String, dynamic>)).toList();
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
