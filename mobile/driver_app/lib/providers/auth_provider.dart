import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// -- States --
abstract class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class Unauthenticated extends AuthState {
  const Unauthenticated();
}

class Authenticated extends AuthState {
  final String token;
  const Authenticated(this.token);
}

// -- Service --
class AuthService {
  // Logic compatible with what tests expect + verification
  Future<Map<String, dynamic>> verifyOtp(
      {required String phone, required String otp}) async {
    // Mock implementation for now, or connect to backend
    // In a real app this calls the API
    await Future.delayed(const Duration(seconds: 1));
    return {'token': 'mock_token_${phone}_$otp'};
  }
}

// -- Providers --
final authServiceProvider = Provider((ref) => AuthService());
final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._authService, this._storage) : super(const AuthInitial());

  // Called to check if we have a token on app start
  Future<void> tryAutoLogin() async {
    final token = await _storage.read(key: 'authToken');
    if (token != null) {
      state = Authenticated(token);
    } else {
      state = const Unauthenticated();
    }
  }

  Future<void> login(String phone, String otp) async {
    try {
      state = const AuthLoading();
      final result = await _authService.verifyOtp(phone: phone, otp: otp);
      final token = result['token'];
      await _storage.write(key: 'authToken', value: token);
      state = Authenticated(token);
    } catch (e) {
      state = const Unauthenticated();
      rethrow;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'authToken');
    state = const Unauthenticated();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authServiceProvider),
    ref.watch(secureStorageProvider),
  );
});
