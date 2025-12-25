class LocationService {
  // Stub location service
  Future<Map<String, double>> getCurrentLocation() async {
    // Mock implementation - returns Nairobi coordinates
    await Future.delayed(const Duration(milliseconds: 500));
    return {
      'latitude': -1.286389,
      'longitude': 36.817223,
    };
  }

  Stream<Map<String, double>> getLocationStream() async* {
    while (true) {
      await Future.delayed(const Duration(seconds: 5));
      yield await getCurrentLocation();
    }
  }
}
