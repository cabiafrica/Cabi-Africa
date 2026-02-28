import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';

class ReferralCommission {
  final double totalCommission;
  final String status;
  final String date;

  ReferralCommission({
    required this.totalCommission,
    required this.status,
    required this.date,
  });

  factory ReferralCommission.fromJson(Map<String, dynamic> json) {
    return ReferralCommission(
      totalCommission: double.tryParse(json['amount'].toString()) ?? 0.0,
      status: json['status'] ?? 'PENDING',
      date: json['date'] ?? '',
    );
  }
}

final referralServiceProvider =
    Provider<ReferralService>((ref) => ReferralService());

class ReferralService {
  final http.Client _client;
  ReferralService({http.Client? client}) : _client = client ?? http.Client();
  String get baseUrl => AppConfig.referralApiUrl;

  Future<Map<String, dynamic>> getReferralStats(String driverId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/admin/referral/my-commissions?driverId=$driverId'),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        return {'error': 'Failed to fetch referral stats'};
      }
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  Future<String> getReferralCode(String driverId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/admin/referral/code?userId=$driverId'),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['code'] ?? 'REF-Unknown';
      }
      return 'Generate Code';
    } catch (e) {
      return 'Error';
    }
  }

  Future<List<dynamic>> getDownline(String userId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/admin/referral/downline?userId=$userId'),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
