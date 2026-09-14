import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class PaymentService {
  final http.Client _client;
  String? _authToken;

  PaymentService({http.Client? client}) : _client = client ?? http.Client();

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_authToken != null) 'Authorization': 'Bearer $_authToken',
      };

  void setAuthToken(String token) => _authToken = token;

  /// Initiates an M-Pesa STK push for the given trip.
  Future<void> payWithMpesa(String tripId, double amount) async {
    try {
      final response = await _client.post(
        Uri.parse('${AppConfig.authApiUrl}/payments/mpesa/initiate'),
        headers: _headers,
        body: jsonEncode({'rideId': tripId, 'amount': amount}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint(
            'payWithMpesa failed: ${response.statusCode} ${response.body}');
        throw Exception('M-Pesa payment initiation failed');
      }
    } catch (e) {
      debugPrint('Error initiating M-Pesa payment: $e');
      rethrow;
    }
  }

  /// Polls the backend for M-Pesa payment confirmation.
  Future<void> verifyPayment(String paymentId) async {
    try {
      final response = await _client.get(
        Uri.parse(
            '${AppConfig.authApiUrl}/payments/mpesa/status/$paymentId'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final paid = data['paid'] == true || data['status'] == 'COMPLETED';
        if (!paid) throw Exception('Payment not yet confirmed');
      } else {
        debugPrint(
            'verifyPayment failed: ${response.statusCode} ${response.body}');
        throw Exception('Payment verification failed');
      }
    } catch (e) {
      debugPrint('Error verifying M-Pesa payment: $e');
      rethrow;
    }
  }
}
