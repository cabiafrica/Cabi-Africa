import 'dart:convert';
import 'dart:io';
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
        final token = data['accessToken'] ?? data['token'];
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

  Future<AuthResult> getMe(String token) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return AuthResult(
          isSignedIn: true,
          user: data,
          token: token,
        );
      } else {
        return AuthResult(isSignedIn: false, error: 'Failed to fetch driver profile');
      }
    } catch (e) {
      return AuthResult(isSignedIn: false, error: e.toString());
    }
  }

  Future<AuthResult> updateProfile({
    required String userId,
    String? name,
    String? preferredPublicName,
    String? imagePath,
    String? imageUrl,
  }) async {
    try {
      final token = await getToken();
      if (token == null) {
        return AuthResult(isSignedIn: false, error: 'Driver is not authenticated');
      }

      String? photoData = imageUrl;
      if (imagePath != null && photoData == null) {
        final file = File(imagePath);
        if (await file.exists()) {
          final bytes = await file.readAsBytes();
          final ext = imagePath.split('.').last.toLowerCase();
          final mime = ext == 'png' ? 'image/png' : 'image/jpeg';
          photoData = 'data:$mime;base64,${base64Encode(bytes)}';
        } else if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
          photoData = imagePath;
        }
      }

      final body = <String, dynamic>{
        if (name != null && name.trim().isNotEmpty) 'fullName': name.trim(),
        if (preferredPublicName != null && preferredPublicName.trim().isNotEmpty) ...{
          'preferredPublicName': preferredPublicName.trim(),
          'nickname': preferredPublicName.trim(),
        },
        if (photoData != null) 'passportPhotoUrl': photoData,
        if (photoData != null) 'profilePicture': photoData,
      };

      // Try PUT /auth/profile first
      final response = await http.put(
        Uri.parse('$baseUrl/auth/profile'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return AuthResult(
          isSignedIn: true,
          user: data,
          token: token,
        );
      } else {
        // Fallback to /users/:id/profile
        final fallbackRes = await http.put(
          Uri.parse('$baseUrl/users/$userId/profile'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: jsonEncode(body),
        ).timeout(const Duration(seconds: 15));

        if (fallbackRes.statusCode == 200 || fallbackRes.statusCode == 201) {
          final data = jsonDecode(fallbackRes.body);
          return AuthResult(
            isSignedIn: true,
            user: data,
            token: token,
          );
        }

        final err = jsonDecode(response.body);
        return AuthResult(isSignedIn: false, error: err['message']?.toString() ?? 'Failed to update profile');
      }
    } catch (e) {
      return AuthResult(isSignedIn: false, error: e.toString());
    }
  }

  Future<bool> verifyBiometrics(String userId) async {
    try {
      final token = await getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/users/$userId/verify-biometric'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

  Future<AuthResult> forgotPassword(String identifier) async {
    try {
      final isEmail = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(identifier);

      final Map<String, dynamic> body = {};
      if (isEmail) {
        body['email'] = identifier;
      } else {
        body['phone'] = identifier.replaceAll(RegExp(r'\s+'), '');
      }

      final response = await http
          .post(
            Uri.parse('$baseUrl/auth/forgot-password'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )
          .timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AuthResult(isSignedIn: false, user: data);
      } else {
        return AuthResult(
          isSignedIn: false,
          error: data['message']?.toString() ?? 'Failed to request reset',
        );
      }
    } catch (e) {
      return AuthResult(isSignedIn: false, error: 'Connection error: $e');
    }
  }

  Future<AuthResult> resetPassword(String token, String newPassword) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/auth/reset-password'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'token': token,
              'newPassword': newPassword,
            }),
          )
          .timeout(const Duration(seconds: 10));

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return AuthResult(isSignedIn: false, user: data);
      } else {
        return AuthResult(
          isSignedIn: false,
          error: data['message']?.toString() ?? 'Failed to reset password',
        );
      }
    } catch (e) {
      return AuthResult(isSignedIn: false, error: 'Connection error: $e');
    }
  }
}
