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
    // Android emulator / physical device fallback
    if (defaultTargetPlatform == TargetPlatform.android) return '192.168.100.35';
    return '127.0.0.1';
  }

  static String get protocol => isProduction && customHost.isEmpty ? 'https' : 'http';

  static String get driverRegistrationUrl => isProduction && customHost.isEmpty
      ? 'https://cabi.africa/drivers/register'
      : '$protocol://$host:3000/drivers/register';

  static String get userPortalUrl => isProduction && customHost.isEmpty
      ? 'https://cabi.africa'
      : '$protocol://$host:3000';
  
  static String get dispatchApiUrl => isProduction && customHost.isEmpty 
      ? 'https://dispatch-service-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3334/api';

  static String get dispatchSocketUrl => isProduction && customHost.isEmpty
      ? 'https://dispatch-service-746659778850.us-central1.run.app'
      : '$protocol://$host:3334';

  static String get authApiUrl => isProduction && customHost.isEmpty
      ? 'https://auth-gateway-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3333/api';

  static String get referralApiUrl => isProduction && customHost.isEmpty
      ? 'https://referral-service-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3337/api';

  static String get saccoApiUrl => isProduction && customHost.isEmpty
      ? 'https://sacco-service-746659778850.us-central1.run.app/api'
      : '$protocol://$host:3338/api';

  static String getSosSocketUrl(String tripId) {
    const wsProtocol = AppConfig.isProduction ? 'wss' : 'ws';
    final socketHost = AppConfig.isProduction 
        ? 'auth-gateway-746659778850.us-central1.run.app' 
        : '${AppConfig.host}:3333';
    return '$wsProtocol://$socketHost/sos/audio/$tripId';
  }
}
