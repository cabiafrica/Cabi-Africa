import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';
import '../services/analytics_service.dart';

// Define the possible states for authentication
abstract class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class Authenticated extends AuthState {
  final String token;
  const Authenticated(this.token);
}

class Unauthenticated extends AuthState {
  const Unauthenticated();
}

// The StateNotifier that will manage the AuthState
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final FlutterSecureStorage _storage;
  final AnalyticsService _analyticsService;

  AuthNotifier(this._authService, this._storage, this._analyticsService)
      : super(const AuthInitial()) {
    tryAutoLogin();
  }

  Future<void> login(String phone, String otp) async {
    try {
      state = const AuthLoading();
      final token = await _authService.verifyOtp(phone: phone, otp: otp);

      await _storage.write(key: 'authToken', value: token);

      // --- Analytics Tracking ---
      await _analyticsService.setUserId(phone); // Use phone as a stable user ID
      await _analyticsService.setUserProperty('account_type', 'passenger');
      await _analyticsService.logEvent('login_success');
      // --------------------------

      state = Authenticated(token);
    } catch (e) {
      state = const Unauthenticated();
      rethrow;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'authToken');
    await _analyticsService.setUserId(null); // Clear user ID on logout
    state = const Unauthenticated();
  }

  Future<void> tryAutoLogin() async {
    final storedToken = await _storage.read(key: 'authToken');
    if (storedToken == null) {
      state = const Unauthenticated();
    } else {
      state = Authenticated(storedToken);
    }
  }
}

class AuthProvider extends ChangeNotifier {
  String? _token;
  bool get isAuthenticated => _token != null;

  void login(String token) {
    _token = token;
    notifyListeners();
  }

  void logout() {
    _token = null;
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    // Just a dummy for now to satisfy splash screen
    notifyListeners();
  }
}
