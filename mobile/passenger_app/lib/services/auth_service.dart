import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class AuthResult {
  final bool isSignedIn;
  final String? error;
  final Map<String, dynamic>? user;
  final String? token;

  AuthResult({required this.isSignedIn, this.error, this.user, this.token});
}

class AuthService {
  String get baseUrl => AppConfig.authApiUrl;

  Future<AuthResult> signIn(
      {required String identifier, required String password}) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/auth/login'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'email':
                  identifier, // Backend usually takes 'email' as the field name even for phone/username
              'password': password
            }),
          )
          .timeout(const Duration(seconds: 12)); // Faster timeout for better UX

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final token = data['accessToken'] ?? data['token'];
        return AuthResult(
          isSignedIn: token != null,
          user: data['user'],
          token: token,
        );
      } else {
        // Immediate error from backend
        String errorMessage = 'Login failed';
        if (data['message'] != null) {
          if (data['message'] is List) {
            errorMessage = (data['message'] as List).join('\n');
          } else {
            errorMessage = data['message'].toString();
          }
        }
        return AuthResult(
          isSignedIn: false,
          error: errorMessage,
        );
      }
    } on TimeoutException {
      return AuthResult(
        isSignedIn: false,
        error:
            'Login request timed out. Please check your internet connection.',
      );
    } catch (e) {
      return AuthResult(
        isSignedIn: false,
        error: 'Connection error: $e',
      );
    }
  }

  Future<AuthResult> register({
    required String firstName,
    required String lastName,
    String? email,
    required String phone,
    required String password,
    String? referralCode,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/auth/register'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'firstName': firstName,
              'lastName': lastName,
              'email': email ??
                  '${phone}@cabi.africa', // Fallback email if using phone registration
              'phone': phone,
              'password': password,
              'role': 'passenger',
              'referralCode': referralCode,
            }),
          )
          .timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return AuthResult(
          isSignedIn: true,
          user: data,
        );
      } else {
        String errorMessage = 'Registration failed';
        if (data['message'] != null) {
          if (data['message'] is List) {
            errorMessage = (data['message'] as List).join('\n');
          } else {
            errorMessage = data['message'].toString();
          }
        }
        return AuthResult(
          isSignedIn: false,
          error: errorMessage,
        );
      }
    } on TimeoutException {
      return AuthResult(
        isSignedIn: false,
        error: 'Registration timed out. Please try again.',
      );
    } catch (e) {
      return AuthResult(
        isSignedIn: false,
        error: 'Connection error: $e',
      );
    }
  }

  Future<void> signOut() async {
    // Clear local storage logic would go here
  }

  Future<AuthResult> verifyOtp(
      {required String phone, required String otp}) async {
    await Future.delayed(const Duration(seconds: 1));
    if (otp == '123456') {
      return AuthResult(
        isSignedIn: true,
        token: 'mock_token',
        user: {'id': 'mock-user-id', 'phone': phone},
      );
    } else {
      return AuthResult(isSignedIn: false, error: 'Invalid OTP');
    }
  }

  Future<void> updateProfile({required String name, String? imagePath}) async {
    await Future.delayed(const Duration(seconds: 1));
  }
}
