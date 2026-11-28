import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../config/app_config.dart';

class DriverSosActivationResult {
  final bool success;
  final String alertId;
  final String obNumber;
  final String trackingUrl;
  final int notifiedCaptainsCount;
  final int distressFeeBilled;
  final String message;

  DriverSosActivationResult({
    required this.success,
    required this.alertId,
    required this.obNumber,
    required this.trackingUrl,
    required this.notifiedCaptainsCount,
    required this.distressFeeBilled,
    required this.message,
  });

  factory DriverSosActivationResult.fromJson(Map<String, dynamic> json) {
    return DriverSosActivationResult(
      success: json['success'] ?? true,
      alertId: json['alertId'] ?? '',
      obNumber: json['obNumber'] ?? '',
      trackingUrl: json['trackingUrl'] ?? 'https://cabi.africa/sos',
      notifiedCaptainsCount: json['notifiedCaptainsCount'] ?? 0,
      distressFeeBilled: json['distressFeeBilled'] ?? 500,
      message: json['message'] ?? 'Distress broadcast sent to Cabi Safety Operations.',
    );
  }
}

class SosService {
  final Dio _dio;
  final FlutterSecureStorage _storage;

  SosService({
    Dio? dio,
    FlutterSecureStorage? storage,
  })  : _dio = dio ?? Dio(),
        _storage = storage ?? const FlutterSecureStorage();

  Future<String?> _resolveToken() async {
    try {
      for (final key in const ['jwt_token', 'auth_token', 'access_token', 'driver_token']) {
        final token = await _storage.read(key: key);
        if (token != null && token.isNotEmpty) return token;
      }
    } catch (_) {}
    return null;
  }

  /**
   * Broadcasts Captain Emergency Distress signal to Dispatch Service & Proximity Mesh
   */
  Future<DriverSosActivationResult> activateSos(String tripId, Map<String, double> position) async {
    final token = await _resolveToken();
    final url = '${AppConfig.dispatchApiUrl}/safety/sos';

    final headers = <String, dynamic>{
      'Content-Type': 'application/json',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    try {
      final response = await _dio.post(
        url,
        data: {
          'tripId': tripId.isNotEmpty ? tripId : 'UNASSIGNED',
          'location': {
            'lat': position['lat'],
            'lon': position['lng'] ?? position['lon'],
          },
        },
        options: Options(
          headers: headers,
          validateStatus: (status) => status != null && status < 500,
        ),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return DriverSosActivationResult.fromJson(response.data);
      } else {
        final err = response.data;
        final msg = err is Map ? (err['message'] ?? 'Failed to activate SOS') : 'Failed to activate SOS';
        throw Exception(msg);
      }
    } catch (e) {
      debugPrint('[SosService] Distress activation failed: $e');
      rethrow;
    }
  }

  /**
   * Good Samaritan Captain responds to proximity distress call and earns reward points
   */
  Future<Map<String, dynamic>> respondToDistress(String incidentId) async {
    final token = await _resolveToken();
    final url = '${AppConfig.dispatchApiUrl}/safety/alerts/$incidentId/respond';

    final headers = <String, dynamic>{};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    final response = await _dio.post(
      url,
      options: Options(headers: headers),
    );

    return response.data is Map<String, dynamic> ? response.data : {'success': true};
  }

  /**
   * Distressed Captain submits a formal pardon request for the KES 500 distress fee
   */
  Future<Map<String, dynamic>> requestPardon(String incidentId, String reason) async {
    final token = await _resolveToken();
    final url = '${AppConfig.dispatchApiUrl}/safety/alerts/$incidentId/pardon-request';

    final headers = <String, dynamic>{};
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    final response = await _dio.post(
      url,
      data: {'reason': reason},
      options: Options(headers: headers),
    );

    return response.data is Map<String, dynamic> ? response.data : {'success': true};
  }
}
