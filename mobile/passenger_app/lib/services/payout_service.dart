class PayoutService {
  Future<void> requestPayout(double amount) async {
    await Future.delayed(const Duration(seconds: 1));
  }

  Future<List<Map<String, dynamic>>> getPayoutHistory() async {
    await Future.delayed(const Duration(seconds: 1));
    return [];
  }
}
