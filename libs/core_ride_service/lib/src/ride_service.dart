class RideService {
  // Stub ride service
  Future<List<Map<String, dynamic>>> getActiveRides() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [];
  }

  Future<Map<String, dynamic>?> acceptRide(String rideId) async {
    await Future.delayed(const Duration(seconds: 1));
    return {
      'id': rideId,
      'status': 'accepted',
    };
  }

  Future<void> startRide(String rideId) async {
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> completeRide(String rideId) async {
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> cancelRide(String rideId, String reason) async {
    await Future.delayed(const Duration(milliseconds: 500));
  }
}
