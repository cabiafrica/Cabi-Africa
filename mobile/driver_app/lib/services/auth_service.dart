import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_jailbreak_detection/flutter_jailbreak_detection.dart';
import '../config/app_config.dart';

class AuthResult {
  final bool isSignedIn;
  final String? error;
  final Map<String, dynamic>? user;
  final String? token;

  AuthResult({required this.isSignedIn, this.error, this.user, this.token});
}

class AuthService {
  final _storage = const FlutterSecureStorage();
  
  String get baseUrl => AppConfig.authApiUrl;

  Future<bool> _isSecureEnvironment() async {
    try {
      bool jailbroken = await FlutterJailbreakDetection.jailbroken;
      // You can also add developerMode check if desired, but blocking dev mode 
      // can block legitimate developers. For production, maybe block root only.
      return !jailbroken;
    } catch (e) {
      return true; // proceed if check fails (optional, could be stricter)
    }
  }

  Future<AuthResult> signIn(String email, String password) async {
    if (!await _isSecureEnvironment()) {
      return AuthResult(isSignedIn: false, error: 'App cannot run on a compromised device.');
    }
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Backend returns { twoFactorRequired, accessToken }
        final token = data['accessToken'] ?? data['token'];
        if (token != null) {
          await _storage.write(key: 'jwt_token', value: token);
        }
        return AuthResult(
          isSignedIn: token != null,
          user: data['user'],
          token: token,
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
          'role': 'driver',
          'licenseNumber': licenseNumber,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final token = data['accessToken'] ?? data['token'];
        if (token != null) {
          await _storage.write(key: 'jwt_token', value: token);
        }
        return AuthResult(
          isSignedIn: true,
          user: data,
          token: token,
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
    await _storage.delete(key: 'jwt_token');
  }

  Future<bool> isSignedIn() async {
    final token = await _storage.read(key: 'jwt_token');
    return token != null;
  }
  
  Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }
}
