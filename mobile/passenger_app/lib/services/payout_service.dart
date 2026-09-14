import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class PayoutService {
  final http.Client _client;
  String? _authToken;

  PayoutService({http.Client? client}) : _client = client ?? http.Client();

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_authToken != null) 'Authorization': 'Bearer $_authToken',
      };

  void setAuthToken(String token) => _authToken = token;

  /// Requests a payout of [amount] from the driver/passenger wallet.
  Future<void> requestPayout(double amount) async {
    try {
      final response = await _client.post(
        Uri.parse('${AppConfig.authApiUrl}/payouts/request'),
        headers: _headers,
        body: jsonEncode({'amount': amount}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint(
            'requestPayout failed: ${response.statusCode} ${response.body}');
        throw Exception('Payout request failed: ${response.body}');
      }
    } catch (e) {
      debugPrint('Error requesting payout: $e');
      rethrow;
    }
  }

  /// Returns the list of past payout transactions.
  Future<List<Map<String, dynamic>>> getPayoutHistory() async {
    try {
      final response = await _client.get(
        Uri.parse('${AppConfig.authApiUrl}/payouts/history'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data);
      }
    } catch (e) {
      debugPrint('Error fetching payout history: $e');
    }
    return [];
  }
}
