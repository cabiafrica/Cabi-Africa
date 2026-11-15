import 'package:flutter/foundation.dart';

class AppConfig {
  // Configurable via --dart-define=IS_PRODUCTION=true; defaults to true in release builds
  static const bool isProduction = bool.fromEnvironment('IS_PRODUCTION', defaultValue: kReleaseMode);

  // Custom API host override via --dart-define=API_HOST=... (empty by default so production URLs are used)
  static const String customHost = String.fromEnvironment('API_HOST', defaultValue: '');

  static String get host {
    if (customHost.isNotEmpty) return customHost;
    if (isProduction) return 'www.cabi.africa';
    if (kIsWeb) return 'localhost';
    // Android emulator / physical device local dev fallback
    if (defaultTargetPlatform == TargetPlatform.android) return '10.0.2.2';
    return '127.0.0.1';
  }

  static String get protocol => isProduction && customHost.isEmpty ? 'https' : 'http';

  static String get driverRegistrationUrl => isProduction && customHost.isEmpty
      ? 'https://www.cabi.africa/drivers/register'
      : '$protocol://$host:3000/drivers/register';

  static String get userPortalUrl => isProduction && customHost.isEmpty
      ? 'https://www.cabi.africa'
      : '$protocol://$host:3000';

  static String get dispatchApiUrl => isProduction && customHost.isEmpty
      ? 'https://www.cabi.africa/api'
      : '$protocol://$host:3334/api';

  static String get dispatchSocketUrl => isProduction && customHost.isEmpty
      ? 'https://dispatch-service-746659778850.us-central1.run.app'
      : '$protocol://$host:3334';

  static String get authApiUrl => isProduction && customHost.isEmpty
      ? 'https://www.cabi.africa/api'
      : '$protocol://$host:3333/api';

  static String get referralApiUrl => isProduction && customHost.isEmpty
      ? 'https://www.cabi.africa/api'
      : '$protocol://$host:3337/api';

  static String get saccoApiUrl => isProduction && customHost.isEmpty
      ? 'https://www.cabi.africa/api'
      : '$protocol://$host:3338/api';

  static String getSosSocketUrl(String tripId) {
    const wsProtocol = AppConfig.isProduction ? 'wss' : 'ws';
    final socketHost = AppConfig.isProduction
        ? 'auth-gateway-746659778850.us-central1.run.app'
        : '${AppConfig.host}:3333';
    return '$wsProtocol://$socketHost/sos/audio/$tripId';
  }
}
