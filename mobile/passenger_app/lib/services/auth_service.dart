import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_jailbreak_detection/flutter_jailbreak_detection.dart';
import '../config/app_config.dart';

class AuthResult {
  final bool isSignedIn;
  final bool needsVerification;
  final String? error;
  final Map<String, dynamic>? user;
  final String? token;

  AuthResult({
    required this.isSignedIn,
    this.needsVerification = false,
    this.error,
    this.user,
    this.token,
  });
}

class AuthService {
  final _storage = const FlutterSecureStorage();
  
  String get baseUrl => AppConfig.authApiUrl;

  Future<bool> _isSecureEnvironment() async {
    try {
      bool jailbroken = await FlutterJailbreakDetection.jailbroken;
      return !jailbroken;
    } catch (e) {
      return true;
    }
  }

  Future<AuthResult> signIn(
      {required String identifier, required String password}) async {
    if (!await _isSecureEnvironment()) {
      return AuthResult(isSignedIn: false, error: 'App cannot run on a compromised device.');
    }
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
                  '$phone@cabi.africa', // Fallback email if using phone registration
              'phone': phone,
              'password': password,
              'role': 'passenger',
              'referralCode': referralCode,
            }),
          )
          .timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);

      if (response.statusCode == 201 || response.statusCode == 200) {
        final token = data['accessToken'] ?? data['token'];
        final userMap = data['user'] is Map<String, dynamic>
            ? data['user'] as Map<String, dynamic>
            : (data is Map<String, dynamic> ? data : null);
        return AuthResult(
          isSignedIn: token != null,
          needsVerification: token == null,
          user: userMap,
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
    await _storage.delete(key: 'jwt_token');
  }
  
  Future<bool> isSignedIn() async {
    final token = await _storage.read(key: 'jwt_token');
    return token != null;
  }
  
  Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  Map<String, dynamic>? _decodeJwt(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      final payload = parts[1];
      final String normalized = base64Url.normalize(payload);
      final String resp = utf8.decode(base64Url.decode(normalized));
      return json.decode(resp);
    } catch (e) {
      return null;
    }
  }

  Future<AuthResult> getMe(String token) async {
    try {
      final payload = _decodeJwt(token);
      final userId = payload?['sub'] ?? payload?['userId'];
      
      if (userId == null) return AuthResult(isSignedIn: false, error: 'Invalid token');

      final response = await http.post(
        Uri.parse('$baseUrl/auth/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'userId': userId}),
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        return AuthResult(
          isSignedIn: true,
          user: data,
          token: token,
        );
      } else {
        return AuthResult(isSignedIn: false, error: 'Failed to fetch profile');
      }
    } catch (e) {
      return AuthResult(isSignedIn: false, error: e.toString());
    }
  }

  Future<AuthResult> verifyOtp(
      {required String phone, required String otp}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'phone': phone, 'otpCode': otp}),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = json.decode(response.body);
        final token = data['token'];
        return AuthResult(
          isSignedIn: true,
          token: token,
          user: data['user'],
        );
      } else {
        final errorData = json.decode(response.body);
        return AuthResult(
          isSignedIn: false,
          error: errorData['message'] ?? 'Invalid OTP',
        );
      }
    } catch (e) {
      return AuthResult(isSignedIn: false, error: 'Connection failed: $e');
    }
  }

  Future<AuthResult> updateProfile({
    required String name,
    String? preferredPublicName,
    String? imagePath,
    String? imageUrl,
  }) async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      if (token == null) {
        return AuthResult(isSignedIn: false, error: 'Not authenticated');
      }

      final payload = _decodeJwt(token);
      final userId = payload?['sub'] ?? payload?['userId'];

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
        'fullName': name,
        if (preferredPublicName != null && preferredPublicName.trim().isNotEmpty) ...{
          'preferredPublicName': preferredPublicName.trim(),
          'nickname': preferredPublicName.trim(),
        },
        if (photoData != null) 'passportPhotoUrl': photoData,
        if (photoData != null) 'profilePicture': photoData,
      };

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
        if (userId != null) {
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
        }
        final err = jsonDecode(response.body);
        return AuthResult(isSignedIn: false, error: err['message']?.toString() ?? 'Failed to update profile');
      }
    } catch (e) {
      return AuthResult(isSignedIn: false, error: e.toString());
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

  Future<AuthResult> deleteAccount({String? reason}) async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      if (token == null) {
        return AuthResult(isSignedIn: false, error: 'Not authenticated');
      }

      final payload = _decodeJwt(token);
      final userId = payload?['sub'] ?? payload?['userId'] ?? 'me';

      final response = await http.delete(
        Uri.parse('$baseUrl/users/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'reason': reason ?? 'Self-service account deletion'}),
      ).timeout(const Duration(seconds: 12));

      if (response.statusCode == 200 || response.statusCode == 204) {
        await signOut();
        return AuthResult(isSignedIn: false);
      } else {
        String msg = 'Failed to delete account';
        try {
          final data = jsonDecode(response.body);
          if (data['message'] != null) msg = data['message'].toString();
        } catch (_) {}
        return AuthResult(isSignedIn: true, error: msg);
      }
    } catch (e) {
      return AuthResult(isSignedIn: true, error: 'Connection error: $e');
    }
  }
}
