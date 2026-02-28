import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class PassengerReferralService {
  String get baseUrl => AppConfig.referralApiUrl;

  // Get the passenger's own referral code to share
  Future<String?> getReferralCode(String userId) async {
    try {
      // Logic to get user profile or specific referral endpoint
      // Assuming GET /referral/code?userId=... or fetching from user profile
      // For now, let's assume we fetch it from the API
      final response = await http.get(
        Uri.parse('$baseUrl/admin/referral/code?userId=$userId'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['code'];
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Apply a referral code from someone else
  Future<Map<String, dynamic>> applyReferralCode(
      String userId, String code) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/admin/referral/apply'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(
            {'userId': userId, 'code': code, 'userType': 'passenger'}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return jsonDecode(response.body);
      } else {
        return {
          'success': false,
          'message':
              jsonDecode(response.body)['message'] ?? 'Failed to apply code'
        };
      }
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getReferralHistory(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/admin/referral/my-commissions?driverId=$userId'),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {'totalEarned': 0, 'history': []};
    } catch (e) {
      return {'totalEarned': 0, 'history': [], 'error': e.toString()};
    }
  }
}
