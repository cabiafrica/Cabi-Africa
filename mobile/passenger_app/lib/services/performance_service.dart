class PerformanceService {
  Future<Map<String, dynamic>> getPerformanceStats() async {
    await Future.delayed(const Duration(seconds: 1));
    return {
      'acceptanceRate': 100.0,
      'cancelRate': 0.0,
      'rating': 5.0,
    };
  }
}
