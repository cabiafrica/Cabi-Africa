import 'dart:convert';
import 'dart:io';

import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;

class SOSService {
  final String baseUrl;
  SOSService({
    this.baseUrl = 'http://10.0.2.2:3333/api',
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
  }
}
