import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';

// -- States --
abstract class AuthState {
  const AuthState();
  Map<String, dynamic>? get user => null;
  String? get userId => null;
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
  @override
  final Map<String, dynamic>? user;
  const Authenticated(this.token, [this.user]);

  @override
  String? get userId => user?['id']?.toString() ?? user?['userId']?.toString();
}

// -- Providers --
final authServiceProvider = Provider((ref) => AuthService());
final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._authService, this._storage) : super(const AuthInitial());

  Map<String, dynamic> _normalizeDriverUser(Map<String, dynamic> rawUser) {
    final normalized = Map<String, dynamic>.from(rawUser);
    if (normalized['driverProfile'] == null) {
      normalized['driverProfile'] = {
        'id': normalized['id'] ?? normalized['userId'],
        'isOnline': false,
        'isBiometricVerified': false,
      };
    }
    return normalized;
  }

  Future<void> tryAutoLogin() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token != null) {
      final res = await _authService.getMe(token);
      if (res.isSignedIn && res.user != null) {
        state = Authenticated(token, _normalizeDriverUser(res.user!));
      } else {
        await _storage.delete(key: 'jwt_token');
        state = const Unauthenticated();
      }
    } else {
      state = const Unauthenticated();
    }
  }

  void updateUser(Map<String, dynamic> updatedFields) {
    if (state is Authenticated) {
      final current = state as Authenticated;
      final updated = Map<String, dynamic>.from(current.user ?? {});
      updated.addAll(updatedFields);
      state = Authenticated(current.token, updated);
    }
  }

  Future<void> login(String email, String password,
      {bool rememberMe = true}) async {
    try {
      state = const AuthLoading();
      final result = await _authService.signIn(email, password);

      if (result.isSignedIn && result.token != null) {
        // Validate that the user has the DRIVER role
        final userRole = result.user?['role']?.toString().toUpperCase();
        if (userRole != 'DRIVER') {
          state = const Unauthenticated();
          throw Exception('This account is not registered as a driver. Please use the passenger app or contact support.');
        }

        if (rememberMe) {
          await _storage.write(key: 'jwt_token', value: result.token);
        } else {
          // Don't persist — session only; do not actively delete existing token
        }
        final userMap = result.user != null
            ? _normalizeDriverUser(result.user!)
            : null;
        state = Authenticated(result.token!, userMap);
      } else {
        state = const Unauthenticated();
        throw Exception(result.error ?? 'Login failed');
      }
    } catch (e) {
      state = const Unauthenticated();
      rethrow;
    }
  }

  Future<void> setSession(String token, Map<String, dynamic>? user) async {
    await _storage.write(key: 'jwt_token', value: token);
    final normalized = user != null ? _normalizeDriverUser(user) : null;
    state = Authenticated(token, normalized);
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    state = const Unauthenticated();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authServiceProvider),
    ref.watch(secureStorageProvider),
  );
});
