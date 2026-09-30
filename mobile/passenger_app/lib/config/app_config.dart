import 'package:flutter/foundation.dart';

class AppConfig {
  // Configurable via --dart-define=IS_PRODUCTION=true, defaults to false for local dev/testing
  static const bool isProduction = bool.fromEnvironment('IS_PRODUCTION', defaultValue: false);
  
  // Custom API host override via --dart-define=API_HOST=192.168.100.35
  static const String customHost = String.fromEnvironment('API_HOST', defaultValue: '192.168.100.35');

  static String get host {
    if (customHost.isNotEmpty) return customHost;
    if (kIsWeb) return 'localhost';
    if (isProduction) return 'auth-gateway-746659778850.us-central1.run.app';
    // Android emulators use 10.0.2.2 to reach host localhost.
    if (defaultTargetPlatform == TargetPlatform.android) return '192.168.100.35';
    return '127.0.0.1';
  }

  static String get protocol => isProduction && customHost.isEmpty ? 'https' : 'http';

  // API Base URLs
  static String get dispatchApiUrl => isProduction && customHost.isEmpty
      ? 'https://dispatch-service-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3334/api';
  
  static String get authApiUrl => isProduction && customHost.isEmpty
      ? 'https://auth-gateway-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3333/api';

  static String get verificationApiUrl => isProduction && customHost.isEmpty
      ? 'https://verification-service-746659778850.us-central1.run.app/api/v1/verification'
      : '$protocol://$host:3003/api/v1/verification';

  static String get referralApiUrl => isProduction && customHost.isEmpty
      ? 'https://referral-service-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3337/api';

  static String get saccoApiUrl => isProduction && customHost.isEmpty
      ? 'https://sacco-service-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3338/api';

  // WebSocket
  static String get socketUrl => isProduction && customHost.isEmpty
      ? 'https://dispatch-service-746659778850.us-central1.run.app'
      : '$protocol://$host:3334';

  // Shared Constants
  static const int apiTimeout = 30000;
  static const int socketTimeout = 5000;
  static const bool enableBiometrics = true;
  static const bool enableRideTracking = true;

  // Map Settings
  static const double defaultLatitude = -1.2921; // Nairobi
  static const double defaultLongitude = 36.8219;
  static const double defaultZoom = 14.0;
}
