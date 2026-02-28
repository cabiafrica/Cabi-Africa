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
  final Map<String, dynamic>? user;
  const Authenticated(this.token, [this.user]);

  String? get userId => user?['id']?.toString() ?? user?['userId']?.toString();
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
      final result = await _authService.verifyOtp(phone: phone, otp: otp);
      if (!result.isSignedIn) {
        throw Exception(result.error ?? 'Verification failed');
      }
      final token = result.token!;

      await _storage.write(key: 'authToken', value: token);

      // --- Analytics Tracking ---
      await _analyticsService.setUserId(phone); // Use phone as a stable user ID
      await _analyticsService.setUserProperty('account_type', 'passenger');
      await _analyticsService.logEvent('login_success');
      // --------------------------

      state = Authenticated(token, result.user);
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
  Map<String, dynamic>? _user;

  bool get isAuthenticated => _token != null;
  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  String? get userId =>
      _user?['id']?.toString() ?? _user?['userId']?.toString();

  void login(String token, [Map<String, dynamic>? user]) {
    _token = token;
    _user = user;
    notifyListeners();
  }

  void logout() {
    _token = null;
    _user = null;
    notifyListeners();
  }

  Future<void> tryAutoLogin() async {
    // TEST BYPASS: Auto-login with mock credentials for testing
    // _token = 'test_token_12345';
    // _user = {
    //   'id': 'test-passenger-001',
    //   'userId': 'test-passenger-001',
    //   'email': 'test@passenger.com',
    //   'firstName': 'Test',
    //   'lastName': 'Passenger',
    //   'role': 'PASSENGER'
    // };
    // notifyListeners();
  }
}

// -- Riverpod Providers --
final analyticsServiceProvider = Provider((ref) => AnalyticsService());
final authServiceProvider = Provider((ref) => AuthService());
final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

final passengerAuthProvider =
    StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authServiceProvider),
    ref.watch(secureStorageProvider),
    ref.watch(analyticsServiceProvider),
  );
});
