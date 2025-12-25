/// A service to fetch configuration values from a remote source.
///
/// This is a mock implementation designed to be replaced by a real service
/// like Firebase Remote Config without changing the calling code.
class ConfigService {
  // A default number to use as a fallback if the remote service is unavailable.
  static const String _defaultEmergencyNumber = '911';

  /// Fetches the emergency number from a remote source.
  ///
  /// In a real implementation, this would connect to a service like
  /// Firebase Remote Config. For now, it returns a mock value.
  Future<String> getEmergencyNumber() async {
    // Simulate a network delay.
    await Future.delayed(const Duration(milliseconds: 50));
    // Simulate fetching a regional number.
    return '999';
  }

  /// Gets the emergency number, with a fallback to a default value.
  Future<String> getEmergencyNumberWithFallback() async {
    try {
      return await getEmergencyNumber();
    } catch (e) {
      print(
        'Error fetching remote config: $e. Using default emergency number.',
      );
      return _defaultEmergencyNumber;
    }
  }
}
