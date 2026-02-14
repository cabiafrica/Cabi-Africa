import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthResult {
  final bool isSignedIn;
  final String? error;
  final Map<String, dynamic>? user;
  final String? token;

  AuthResult({required this.isSignedIn, this.error, this.user, this.token});
}

class AuthService {
  final String baseUrl = 'http://10.0.2.2:3333/api'; // For Android Emulator

  Future<AuthResult> signIn(
      {required String email, required String password}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AuthResult(
          isSignedIn: true,
          user: data['user'],
          token: data['token'],
        );
      } else {
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
    required String email,
    required String phone,
    required String password,
    String? referralCode,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'phone': phone,
          'password': password,
          'role': 'passenger',
          'referralCode': referralCode,
        }),
      );

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
