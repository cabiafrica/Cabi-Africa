class AuthService {
  // Stub authentication service
  Future<bool> signIn(String email, String password) async {
    // Mock implementation
    await Future.delayed(const Duration(seconds: 1));
    return true;
  }

  Future<void> signOut() async {
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<bool> isSignedIn() async {
    return false;
  }

  Future<String?> getCurrentUserId() async {
    return null;
  }
}
