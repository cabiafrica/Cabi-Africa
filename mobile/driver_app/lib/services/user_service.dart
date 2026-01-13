import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class UserService {
  static const String _baseUrl = 'http://10.0.2.2:3333/api';

  Future<Map<String, dynamic>> getUserProfile() async {
    // In a real app, this would fetch the full user profile.
    // We simulate the backend randomly requiring a check.
    debugPrint("Checking user profile for biometric requirement...");
    await Future.delayed(const Duration(seconds: 1));
    return {
      'userId': 'driver-123',
      'fullName': 'Test Driver',
      'requiresBiometricCheck': true, // Hardcoded to true for demonstration
    };
  }

  Future<void> postBiometricSuccess() async {
    final response = await http.post(
      Uri.parse('$_baseUrl/users/verify-biometric'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    if (response.statusCode != 200) {
      throw const HttpException('Failed to confirm biometric verification.');
    }
    debugPrint("Biometric success posted to backend.");
  }

  Future<void> postBiometricFailure() async {
    final response = await http.post(
      Uri.parse('$_baseUrl/users/biometric-failed'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
    );
    if (response.statusCode != 200) {
      throw const HttpException('Failed to report biometric failure.');
    }
    debugPrint(
        "Biometric failure posted to backend, user should be suspended.");
  }
}
