class AuthResult {
  final bool isSignedIn;
  final String? error;

  AuthResult({required this.isSignedIn, this.error});
}

class AuthService {
  Future<AuthResult> signIn(String phone, String password) async {
    // Mock implementation
    await Future.delayed(const Duration(seconds: 1));
    if (phone.isNotEmpty && password.isNotEmpty) {
      return AuthResult(isSignedIn: true);
    } else {
      return AuthResult(isSignedIn: false, error: "Invalid credentials");
    }
  }
}
