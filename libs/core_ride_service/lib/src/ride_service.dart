import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class RideService {
  String get _baseUrl {
    if (kIsWeb) return 'http://localhost:3000';
    if (defaultTargetPlatform == TargetPlatform.android)
      return 'http://10.0.2.2:3000';
    return 'http://localhost:3000';
  }

  Future<List<Map<String, dynamic>>> getActiveRides() async {
    try {
      // Assuming endpoint for active rides.
      // The backend 'dispatch-service' exposed 'dispatch/rides' for *all* active rides (dashboard).
      // Driver might want 'rides/available'?
      // For now, I'll use the dispatch endpoint or a new one.
      // Let's use 'dispatch/rides' as a proxy for "Marketplace"
      final response = await http.get(Uri.parse('$_baseUrl/dispatch/rides'));

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      if (kDebugMode) print('Error fetching rides: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>> createRide(
      String passengerId, dynamic pickup, dynamic dropoff) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/rides'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'passengerId': passengerId,
        'pickup': pickup,
        'dropoff': dropoff,
      }),
    );
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create ride: ${response.body}');
    }
  }

  Future<Map<String, dynamic>?> acceptRide(
      String rideId, String driverId) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/rides/$rideId/accept'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'driverId': driverId}),
    );

    if (response.statusCode == 201 || response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to accept ride: ${response.body}');
  }

  Future<void> startRide(String rideId) async {
    final response =
        await http.post(Uri.parse('$_baseUrl/rides/$rideId/start'));
    if (response.statusCode != 201 && response.statusCode != 200) {
      throw Exception('Failed to start ride: ${response.body}');
    }
  }

  Future<void> completeRide(String rideId) async {
    final response =
        await http.put(Uri.parse('$_baseUrl/rides/$rideId/complete'));
    if (response.statusCode != 200) {
      throw Exception('Failed to complete ride: ${response.body}');
    }
  }

  Future<void> cancelRide(String rideId, String reason) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/rides/$rideId/cancel'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'reason': reason}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        if (kDebugMode) print('Failed to cancel ride: ${response.body}');
      }
    } catch (e) {
      if (kDebugMode) print('Error cancelling ride: $e');
    }
  }
}
