import 'package:flutter/foundation.dart';

class AppConfig {
  // Auto-detect production environment based on build mode
  static const bool isProduction = kReleaseMode;

  static String get host => isProduction 
      ? 'auth-gateway-746659778850.us-central1.run.app'
      : (kIsWeb ? '192.168.100.35' : (defaultTargetPlatform == TargetPlatform.android ? '10.0.2.2' : 'localhost'));

  static String get protocol => isProduction ? 'https' : 'http';

  static String get driverRegistrationUrl => isProduction
      ? 'https://user-portal-746659778850.us-central1.run.app/drivers/register'
      : '$protocol://$host:3000/drivers/register';

  static String get userPortalUrl => isProduction
      ? 'https://user-portal-746659778850.us-central1.run.app'
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
