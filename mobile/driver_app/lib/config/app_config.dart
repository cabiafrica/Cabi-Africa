import 'package:flutter/foundation.dart';

class AppConfig {
  // Configurable via --dart-define=IS_PRODUCTION=true
  static const bool isProduction = bool.fromEnvironment('IS_PRODUCTION', defaultValue: false);
  
  // Custom API host override via --dart-define=API_HOST=192.168.100.35
  static const String customHost = String.fromEnvironment('API_HOST', defaultValue: '192.168.100.35');

  static String get host {
    if (isProduction) return 'auth-gateway-746659778850.us-central1.run.app';
    if (kIsWeb) return 'localhost';
    if (customHost.isNotEmpty && customHost != '192.168.100.35') return customHost;
    if (defaultTargetPlatform == TargetPlatform.android) return '192.168.43.75';
    return '127.0.0.1';
  }

  static String get protocol => isProduction ? 'https' : 'http';

  static String get driverRegistrationUrl => isProduction
      ? 'https://cabi.africa/drivers/register'
      : '$protocol://$host:3000/drivers/register';

  static String get userPortalUrl => isProduction
      ? 'https://cabi.africa'
      : '$protocol://$host:3000';
  
  static String get dispatchApiUrl => isProduction 
      ? 'https://dispatch-service-746659778850.us-central1.run.app/api'
      : 'http://$host:3334/api';

  static String get dispatchSocketUrl => isProduction
      ? 'https://dispatch-service-746659778850.us-central1.run.app'
      : 'http://$host:3334';

  static String get authApiUrl => isProduction
      ? 'https://auth-gateway-746659778850.us-central1.run.app/api'
      : 'http://$host:3333/api';

  static String get referralApiUrl => isProduction
      ? 'https://referral-service-746659778850.us-central1.run.app/api'
      : 'http://$host:3337/api';

  static String get saccoApiUrl => isProduction
      ? 'https://sacco-service-746659778850.us-central1.run.app/api'
      : 'http://$host:3338/api';

  static String getSosSocketUrl(String tripId) {
    const wsProtocol = AppConfig.isProduction ? 'wss' : 'ws';
    final socketHost = AppConfig.isProduction 
        ? 'auth-gateway-746659778850.us-central1.run.app' 
        : '${AppConfig.host}:3333';
    return '$wsProtocol://$socketHost/sos/audio/$tripId';
  }
}
