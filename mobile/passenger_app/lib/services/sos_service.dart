import 'dart:convert';
import 'dart:io';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class SosActivationResult {
  final bool success;
  final String alertId;
  final String obNumber;
  final String trackingUrl;
  final int notifiedCaptainsCount;
  final String message;

  SosActivationResult({
    required this.success,
    required this.alertId,
    required this.obNumber,
    required this.trackingUrl,
    required this.notifiedCaptainsCount,
    required this.message,
  });

  factory SosActivationResult.fromJson(Map<String, dynamic> json) {
    return SosActivationResult(
      success: json['success'] ?? true,
      alertId: json['alertId'] ?? '',
      obNumber: json['obNumber'] ?? '',
      trackingUrl: json['trackingUrl'] ?? 'https://cabi.africa/sos',
      notifiedCaptainsCount: json['notifiedCaptainsCount'] ?? 0,
      message: json['message'] ?? 'Emergency SOS dispatched to Safety Command Center.',
    );
  }
}

class SOSService {
  final String baseUrl;
  final FlutterSecureStorage _storage;

  SOSService({
    String? baseUrl,
    FlutterSecureStorage? storage,
  })  : baseUrl = baseUrl ?? AppConfig.dispatchApiUrl,
        _storage = storage ?? const FlutterSecureStorage();

  Future<String?> _resolveAuthToken() async {
    try {
      final token = await _storage.read(key: 'jwt_token');
      if (token != null && token.isNotEmpty) return token;
    } catch (_) {}

    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('jwt_token') ?? prefs.getString('authToken') ?? prefs.getString('token');
  }

  Future<SosActivationResult> activateSOS({
    required String tripId,
    required Position position,
    String? passengerId,
    String? driverId,
    String? vehicleId,
    String? rideId,
    List<Map<String, dynamic>>? emergencyContacts,
  }) async {
    final token = await _resolveAuthToken();
    final effectiveTripId = tripId.isNotEmpty ? tripId : (rideId ?? 'UNASSIGNED');

    final headers = <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    };
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    final payload = <String, dynamic>{
      'tripId': effectiveTripId,
      'location': {
        'lat': position.latitude,
        'lon': position.longitude,
      },
    };
    if (emergencyContacts != null && emergencyContacts.isNotEmpty) {
      payload['emergencyContacts'] = emergencyContacts;
    }

    final response = await http.post(
      Uri.parse('$baseUrl/safety/sos'),
      headers: headers,
      body: jsonEncode(payload),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final responseBody = jsonDecode(response.body);
      return SosActivationResult.fromJson(responseBody);
    } else {
      String errorMessage = 'Failed to activate SOS.';
      try {
        final err = jsonDecode(response.body);
        if (err['message'] != null) {
          errorMessage = err['message'] is List ? err['message'].join(', ') : err['message'];
        }
      } catch (_) {}
      throw HttpException(errorMessage);
    }
  }
}
