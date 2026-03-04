import 'package:flutter/foundation.dart';

class AppConfig {
  static String get host => kIsWeb
      ? 'localhost'
      : (defaultTargetPlatform == TargetPlatform.android
          ? '10.0.2.2'
          : 'localhost');
  // In a real app, this would be loaded from an environment-specific
  // configuration file (e.g., .env) and not hardcoded.
  static String get driverRegistrationUrl =>
      'http://$host:3000/drivers/register';
  static String get dispatchApiUrl => 'http://$host:3334/api';
  static String get dispatchSocketUrl => 'http://$host:3334';
  static String get authApiUrl => 'http://$host:3010/api/v1';
  static String get referralApiUrl => 'http://$host:3337/api';
  static String get saccoApiUrl => 'http://$host:3338/api';
}
