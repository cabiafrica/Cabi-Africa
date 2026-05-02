import '../config/app_config.dart';
import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
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
            '$_dispatchBaseUrl/dispatch/rides/current?userId=$userId&role=$role'),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Error fetching current ride: $e');
    }
    return null;
  }

  // Complete a trip
  Future<double> completeTrip(String tripId) async {
    try {
      final response = await _client.patch(
        Uri.parse('$_dispatchBaseUrl/dispatch/rides/$tripId/complete'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        debugPrint('Trip $tripId completed via backend.');
        
        // Try to get actual fare from backend response
        if (data['fare'] != null) {
          return (data['fare'] as num).toDouble();
        }
        if (data['ride'] != null && data['ride']['fare'] != null) {
          return (data['ride']['fare'] as num).toDouble();
        }
        
        return 0.0; // Return 0 if no fare data found, UI should handle this
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
        Uri.parse('$_dispatchBaseUrl/dispatch/rides/$rideId/accept'),
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
      final response = await _client.patch(
        Uri.parse('$_dispatchBaseUrl/dispatch/rides/$rideId/status'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': 'IN_PROGRESS'}),
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
      final body = jsonEncode({'status': 'CANCELLED'});
      await _client.patch(
        Uri.parse('$_dispatchBaseUrl/dispatch/rides/$rideId/status'),
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
        Uri.parse('$_dispatchBaseUrl/dispatch/rides/$tripId/rate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'rating': rating, 'comment': comment}),
      );
      debugPrint('Ride $tripId rated $rating stars.');
    } catch (e) {
      debugPrint('Error rating ride: $e');
    }
  }

  Future<void> confirmCashPayment(String tripId, double amount) async {
    try {
      await _client.post(
        Uri.parse('$_dispatchBaseUrl/dispatch/rides/$tripId/confirm-cash'),
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
}

final rideServiceProvider = Provider((ref) => RideService());
