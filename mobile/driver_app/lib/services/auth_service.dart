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

  Future<AuthResult> signIn(String email, String password) async {
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
        return AuthResult(
          isSignedIn: false,
          error: data['message'] ?? 'Login failed',
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
    String? licenseNumber,
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
          'role': 'DRIVER',
          'licenseNumber': licenseNumber,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        return AuthResult(
          isSignedIn: true,
          user: data,
        );
      } else {
        return AuthResult(
          isSignedIn: false,
          error: data['message'] ?? 'Registration failed',
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
    // Clear local storage logic
  }

  Future<bool> isSignedIn() async {
    // Check if token exists in local storage
    return false;
  }
}
