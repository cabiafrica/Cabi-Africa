import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';

class SaccoTransaction {
  final String id;
  final double amount;
  final String type;
  final String date;

  SaccoTransaction({
    required this.id,
    required this.amount,
    required this.type,
    required this.date,
  });

  factory SaccoTransaction.fromJson(Map<String, dynamic> json) {
    return SaccoTransaction(
      id: json['id'] ?? '',
      amount: double.tryParse(json['amount'].toString()) ?? 0.0,
      type: json['type'] ?? 'UNKNOWN',
      date: json['createdAt'] ?? '',
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

  // Placeholder for getting driver's savings balance
  // Start backend implementation pending
  Future<Map<String, dynamic>> getSavingsBalance(String driverId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/sacco/balance?driverId=$driverId'),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'totalSavings': 0.0, 'availableWithdrawal': 0.0};
      }
    } catch (e) {
      return {
        'totalSavings': 0.0,
        'availableWithdrawal': 0.0,
        'error': e.toString()
      };
    }
  }

  // Placeholder for getting transaction history
  Future<List<SaccoTransaction>> getTransactions(String driverId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/sacco/transactions?driverId=$driverId'),
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => SaccoTransaction.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
