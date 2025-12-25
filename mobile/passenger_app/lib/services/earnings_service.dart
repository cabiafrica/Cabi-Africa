class EarningsService {
  Future<Map<String, dynamic>> getEarnings() async {
    // Mock implementation
    await Future.delayed(const Duration(seconds: 1));
    return {'total': 0.0, 'today': 0.0, 'week': 0.0, 'history': []};
  }
}
