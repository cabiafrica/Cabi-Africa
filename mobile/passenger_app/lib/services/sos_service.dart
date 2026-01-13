import 'dart:convert';
import 'dart:io';

import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

class SOSService {
  final String baseUrl;
  final String occurrenceServiceUrl;

  SOSService({
    this.baseUrl = 'http://10.0.2.2:3333/api',
    this.occurrenceServiceUrl = 'http://10.0.2.2:3005',
  });

  Future<void> activateSOS({
    required String tripId,
    required String passengerId,
    required Position position,
    String? driverId,
    String? vehicleId,
    String? rideId,
  }) async {
    // 1. Call original SOS endpoint
    final response = await http.post(
      Uri.parse('$baseUrl/sos/activate'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        // 'Authorization': 'Bearer YOUR_AUTH_TOKEN'
      },
      body: jsonEncode(<String, dynamic>{
        'tripId': tripId,
        'location': {'lat': position.latitude, 'lon': position.longitude},
      }),
    );

    if (response.statusCode != 200) {
      final responseBody = jsonDecode(response.body);
      throw HttpException(responseBody['message'] ?? 'Failed to activate SOS.');
    }

    // 2. Create occurrence record via webhook
    try {
      await http.post(
        Uri.parse('$occurrenceServiceUrl/integrations/sos'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(<String, dynamic>{
          'tripId': tripId,
          'rideId': rideId,
          'passengerId': passengerId,
          'driverId': driverId,
          'vehicleId': vehicleId,
          'location': {
            'lat': position.latitude,
            'lng': position.longitude,
          },
          'timestamp': DateTime.now().toIso8601String(),
          'userId': passengerId,
        }),
      );
      // Don't throw if occurrence creation fails - SOS is more important
    } catch (e) {
      print('Warning: Failed to create occurrence record: $e');
    }
  }
}
