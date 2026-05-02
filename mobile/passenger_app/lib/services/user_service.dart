class UserService {
  Future<Map<String, dynamic>> getNetworkData() async {
    await Future.delayed(const Duration(seconds: 1));
    return {
      'status': 'UNLOCKED',
      'data': {
        'totalEarnings': 15000.50,
        'tier1Count': 5,
        'tier2Count': 12,
        'recentTransactions': [
          {'amount': 250.0, 'date': DateTime.now().toIso8601String()},
          {
            'amount': 100.0,
            'date': DateTime.now()
                .subtract(const Duration(days: 1))
                .toIso8601String()
          },
        ]
      }
    };
  }

  Future<Map<String, dynamic>> getProfile() async {
    await Future.delayed(const Duration(seconds: 1));
    return {
      'requiresBiometricCheck': false,
      'name': 'Elite Member',
      'email': 'member@prestige.cabi'
    };
  }

  Future<void> verifyBiometric() async {
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> biometricFailed() async {
    await Future.delayed(const Duration(milliseconds: 500));
  }
}
