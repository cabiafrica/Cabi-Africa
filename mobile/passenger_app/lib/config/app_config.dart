import 'package:flutter/foundation.dart';

class AppConfig {
  static String get host {
    if (kIsWeb) return 'localhost';
    if (defaultTargetPlatform == TargetPlatform.android)
      return '10.0.2.2'; // Android Emulator
    return 'localhost';
  }

  // API Base URLs
  static String get dispatchApiUrl => 'http://$host:3334/api';
  // Using auth-gateway for unified authentication.
  static String get authApiUrl => 'http://$host:3333/api';
  static String get verificationApiUrl =>
      'http://$host:3003/api/v1/verification';
  static String get contentApiUrl => 'http://$host:3001/api';
  static String get referralApiUrl => 'http://$host:3337/api';

  // WebSocket
  static String get socketUrl => 'http://$host:3334';

  // Timeouts
  static const int apiTimeout = 30000; // 30 seconds
  static const int socketTimeout = 5000; // 5 seconds

  // Features
  static const bool enableBiometrics = true;
  static const bool enableRideTracking = true;
  static const bool enablePushNotifications = true;

  // Verification Settings
  static const int maxFreeTrips = 1;
  static const int selfieReverificationDays = 30;
  static const int fingerprintReverificationDays = 90;

  // File Upload
  static const int maxImageSize = 10 * 1024 * 1024; // 10MB
  static const List<String> allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  // Map Settings
  static const double defaultLatitude = -1.2921; // Nairobi
  static const double defaultLongitude = 36.8219;
  static const double defaultZoom = 14.0;
  static const double searchRadius = 10.0; // km

  // Ride Settings
  static const int driverSearchRadius = 5; // km
  static const int maxWaitTimeMinutes = 10;
  static const double surgeThreshold = 1.5;

  // Cache Settings
  static const bool enableCache = true;
  static const int cacheMaxAge = 24; // hours
  static const int maxCacheSize = 100; // MB

  // Environment
  static const bool isProduction = false;
  static const bool enableLogging = true;
}
