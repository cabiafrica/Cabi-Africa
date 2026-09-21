import '../config/app_config.dart';
import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class RideService {
  final http.Client _client;

  RideService({http.Client? client}) : _client = client ?? http.Client();
  String get _dispatchBaseUrl => AppConfig.dispatchApiUrl;

  Future<bool> getDriverStatus(String driverId) async {
    try {
      final response = await _client.get(
        Uri.parse('$_dispatchBaseUrl/dispatch/drivers/$driverId/status'),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['isOnline'] ?? false;
      }
    } catch (e) {
      debugPrint('Error fetching driver status: $e');
    }
    return false;
  }

  Future<void> toggleOnlineStatus(String driverId, bool isOnline) async {
    try {
      await _client.post(
        Uri.parse('$_dispatchBaseUrl/dispatch/drivers/$driverId/toggle-status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'isOnline': isOnline}),
      );
    } catch (e) {
      debugPrint('Error toggling driver status: $e');
    }
  }

  Future<Map<String, dynamic>?> getCurrentRide(
      String userId, String role) async {
    try {
      final response = await _client.get(
        Uri.parse(
            '$_dispatchBaseUrl/rides/current?userId=$userId&role=$role'),
      );
      if (response.statusCode == 200 && response.body.isNotEmpty && response.body.trim() != 'null') {
        final decoded = jsonDecode(response.body);
        if (decoded is Map<String, dynamic>) {
          return decoded;
        }
      }
    } catch (e) {
      debugPrint('Error fetching current ride: $e');
    }
    return null;
  }

  // Complete a trip
  Future<double> completeTrip(String tripId) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$tripId/complete'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (response.body.isNotEmpty && response.body.trim() != 'null') {
          final data = jsonDecode(response.body);
          debugPrint('Trip $tripId completed via backend.');
          
          if (data['fare'] != null) {
            return (data['fare'] as num).toDouble();
          }
          if (data['ride'] != null && data['ride']['fare'] != null) {
            return (data['ride']['fare'] as num).toDouble();
          }
        }
        return 0.0;
      } else {
        debugPrint('Backend completeTrip failed: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      debugPrint('Error completing trip: $e');
    }
    return 0.0;
  }

  Future<void> acceptRide(String rideId, String driverId) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/accept'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'driverId': driverId}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        debugPrint('Ride $rideId accepted via backend.');
      } else {
        debugPrint(
            'Backend acceptRide failed: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      debugPrint('Error accepting ride: $e');
    }
  }

  Future<void> startTrip(String rideId) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/start'),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        debugPrint('Ride $rideId started via backend.');
      } else {
        debugPrint(
            'Backend startTrip failed: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      debugPrint('Error starting ride: $e');
    }
  }

  Future<void> rejectRide(String rideId, String driverId,
      [String? reason]) async {
    try {
      final body = jsonEncode({'driverId': driverId, 'reason': reason});
      await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/reject'),
        headers: {'Content-Type': 'application/json'},
        body: body,
      );
      debugPrint(
          'Ride $rideId rejected via backend. Reason: ${reason ?? "none"}');
    } catch (e) {
      debugPrint('Error rejecting ride: $e');
    }
  }

  Future<void> ratePassenger(String rideId, int rating) async {
    // Legacy support if needed, but prefer submitRating
    await submitRating(tripId: rideId, rating: rating.toDouble());
  }

  Future<void> submitRating(
      {required String tripId, required double rating, String? comment}) async {
    try {
      await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$tripId/rate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'rating': rating.round(), 'comment': comment}),
      );
      debugPrint('Ride $tripId rated $rating stars.');
    } catch (e) {
      debugPrint('Error rating ride: $e');
    }
  }

  Future<void> confirmCashPayment(String tripId, double amount) async {
    try {
      await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$tripId/confirm-cash'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'amount': amount}),
      );
      debugPrint('Cash payment confirmed for trip $tripId.');
    } catch (e) {
      debugPrint('Error confirming cash payment: $e');
    }
  }

  Future<void> updateDriverLocation(
      String driverId, double lat, double lng) async {
    try {
      await _client.post(
        Uri.parse('$_dispatchBaseUrl/dispatch/drivers/$driverId/location'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'lat': lat, 'lng': lng}),
      );
    } catch (e) {
      debugPrint('Error updating location: $e');
    }
  }

  Future<void> passRide(String rideId, String driverId, [String? reason]) async {
    try {
      final body = jsonEncode({'driverId': driverId, 'reason': reason ?? 'Driver passed'});
      await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/pass'),
        headers: {'Content-Type': 'application/json'},
        body: body,
      );
      debugPrint('Ride $rideId passed via backend. Reason: ${reason ?? "Driver passed"}');
    } catch (e) {
      debugPrint('Error passing ride: $e');
    }
  }

  Future<bool> updateDriverPreferences(
    String driverId, {
    Map<String, dynamic>? preferredDestination,
    List<Map<String, dynamic>>? excludedZones,
  }) async {
    try {
      final Map<String, dynamic> body = {};
      if (preferredDestination != null) {
        body['preferredDestination'] = preferredDestination;
      }
      if (excludedZones != null) {
        body['excludedZones'] = excludedZones;
      }
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/drivers/$driverId/preferences'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('Error updating driver preferences: $e');
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getDemandHotspots() async {
    try {
      final response = await _client.get(
        Uri.parse('$_dispatchBaseUrl/rides/demand-hotspots'),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map<String, dynamic> && data['data'] is List) {
          return List<Map<String, dynamic>>.from(data['data']);
        }
      }
    } catch (e) {
      debugPrint('Error fetching demand hotspots: $e');
    }
    return [];
  }
}

