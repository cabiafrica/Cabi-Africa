import 'package:flutter/foundation.dart';

class AppConfig {
  // Auto-detect production environment based on build mode
  static const bool isProduction = kReleaseMode;

  static String get host {
    if (isProduction) return 'auth-gateway-746659778850.us-central1.run.app';
    if (kIsWeb) return 'localhost';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return '10.0.2.2'; // Android Emulator
    }
    return 'localhost';
  }

  static String get protocol => isProduction ? 'https' : 'http';

  // API Base URLs
  static String get dispatchApiUrl => isProduction 
      ? 'https://dispatch-service-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3334/api';
  
  static String get authApiUrl => isProduction
      ? 'https://auth-gateway-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3333/api';

  static String get verificationApiUrl => isProduction
      ? 'https://verification-service-746659778850.us-central1.run.app/api/v1/verification'
      : '$protocol://$host:3003/api/v1/verification';

  static String get referralApiUrl => isProduction
      ? 'https://referral-service-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3337/api';

  static String get saccoApiUrl => isProduction
      ? 'https://sacco-service-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3338/api';

  // WebSocket
  static String get socketUrl => isProduction
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
