import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/auth_service.dart';

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
  final Map<String, dynamic>? user;
  const Authenticated(this.token, [this.user]);

  String? get userId => user?['id']?.toString() ?? user?['userId']?.toString();
}

// -- Providers --
final authServiceProvider = Provider((ref) => AuthService());
final secureStorageProvider = Provider((ref) => const FlutterSecureStorage());

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._authService, this._storage) : super(const AuthInitial());

  Future<void> tryAutoLogin() async {
    final token = await _storage.read(key: 'authToken');
    if (token != null) {
      // In a real app, we'd fetch the user profile from the token here
      state = Authenticated(token);
    } else {
      state = const Unauthenticated();
    }
  }

  Future<void> login(String email, String password,
      {bool rememberMe = true}) async {
    try {
      state = const AuthLoading();
      final result = await _authService.signIn(email, password);

      if (result.isSignedIn && result.token != null) {
        if (rememberMe) {
          await _storage.write(key: 'authToken', value: result.token);
        } else {
          await _storage.delete(
              key: 'authToken'); // Ensure old sessions are wiped
        }
        state = Authenticated(result.token!, result.user);
      } else {
        state = const Unauthenticated();
        throw Exception(result.error ?? 'Login failed');
      }
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
