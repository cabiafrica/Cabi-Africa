class UserService {
  Future<Map<String, dynamic>> getNetworkData() async {
    return {
      'status': 'UNLOCKED',
      'data': {
        'totalEarnings': 0.0,
        'tier1Count': 0,
        'tier2Count': 0,
        'recentTransactions': []
      }
    };
  }

  Future<Map<String, dynamic>> getProfile() async {
    return {
      'requiresBiometricCheck': false,
      'name': 'Passenger',
      'email': ''
    };
  }

  Future<void> verifyBiometric() async {
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> biometricFailed() async {
    await Future.delayed(const Duration(milliseconds: 500));
  }
}
