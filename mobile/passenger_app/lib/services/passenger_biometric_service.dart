import 'package:shared_preferences/shared_preferences.dart';
import '../widgets/security_verification_modal.dart';

class PassengerBiometricService {
  static const String _keyConfigured = 'cabi_passenger_biometric_configured';
  static const String _keyMethod = 'cabi_passenger_biometric_method';
  static const String _keyVerifiedAt = 'cabi_passenger_biometric_verified_at';

  /// Check if the passenger has completed the one-time biometric setup
  static Future<bool> isConfigured() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_keyConfigured) ?? false;
  }

  /// Get preferred verification method: 'FACE_RECOGNITION', 'FINGERPRINT', or 'OTP'
  static Future<String> getPreferredMethod() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyMethod) ?? 'FACE_RECOGNITION';
  }

  /// Save preferred biometric settings
  static Future<void> saveSettings({
    required String method,
    bool isConfigured = true,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyConfigured, isConfigured);
    await prefs.setString(_keyMethod, method);
    await prefs.setString(_keyVerifiedAt, DateTime.now().toIso8601String());
  }

  /// Clear biometric settings (for re-enrollment or test reset)
  static Future<void> resetSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyConfigured);
    await prefs.remove(_keyMethod);
    await prefs.remove(_keyVerifiedAt);
  }

  /// Convert string to VerificationMethod enum
  static VerificationMethod methodFromString(String method) {
    switch (method.toUpperCase()) {
      case 'FINGERPRINT':
        return VerificationMethod.fingerprint;
      case 'OTP':
        return VerificationMethod.otp;
      case 'FACE_RECOGNITION':
      case 'FACE':
      default:
        return VerificationMethod.face;
    }
  }

  /// Convert enum to backend string representation
  static String methodToString(VerificationMethod method) {
    switch (method) {
      case VerificationMethod.fingerprint:
        return 'FINGERPRINT';
      case VerificationMethod.otp:
        return 'OTP';
      case VerificationMethod.face:
        return 'FACE_RECOGNITION';
    }
  }

  /// User-friendly label for display
  static String methodDisplayName(String method) {
    switch (method.toUpperCase()) {
      case 'FINGERPRINT':
        return 'Fingerprint Biometrics';
      case 'OTP':
        return 'SMS OTP Verification';
      case 'FACE_RECOGNITION':
      case 'FACE':
      default:
        return 'Face Recognition Scan';
    }
  }
}
