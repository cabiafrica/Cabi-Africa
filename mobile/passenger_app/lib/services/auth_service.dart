class AuthResult {
  final bool isSignedIn;
  final String? error;

  AuthResult({required this.isSignedIn, this.error});
}

class AuthService {
  Future<bool> signIn(
      {required String phoneNumber, required String password}) async {
    // Mock implementation for MVP
    await Future.delayed(const Duration(seconds: 1));
    if (phoneNumber.isNotEmpty && password.isNotEmpty) {
      return true;
    } else {
      return false;
    }
  }

  Future<String> verifyOtp({required String phone, required String otp}) async {
    await Future.delayed(const Duration(seconds: 1));
    if (otp == '123456') {
      return 'mock_token';
    } else {
      throw Exception('Invalid OTP');
    }
  }

  Future<void> register({
    required String fullName,
    required String phone,
    required String password,
    String? referralCode,
  }) async {
    await Future.delayed(const Duration(seconds: 1));
  }

  Future<void> updateProfile({required String name, String? imagePath}) async {
    await Future.delayed(const Duration(seconds: 1));
  }

  Future<void> signOut() async {
    await Future.delayed(const Duration(milliseconds: 500));
  }
}
