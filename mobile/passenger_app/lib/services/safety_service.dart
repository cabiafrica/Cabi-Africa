class SafetyService {
  // Singleton pattern for the mock service
  static final SafetyService _instance = SafetyService._internal();
  factory SafetyService() => _instance;
  SafetyService._internal();

  Future<void> logEmergencyEvent() async {
    // In a real application, this would send an alert to the backend
    print('SOS Event Logged: Passenger initiated emergency call.');
  }
}
