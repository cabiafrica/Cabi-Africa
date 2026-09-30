import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class PayoutMethod {
  final String id;
  final String type; // 'mpesa' or 'bank'
  final String display; // e.g., "M-Pesa: ***678" or "KCB: ***1234"
  bool isDefault;

  PayoutMethod({
    required this.id,
    required this.type,
    required this.display,
    this.isDefault = false,
  });

  factory PayoutMethod.fromJson(Map<String, dynamic> json) {
    return PayoutMethod(
      id: json['id'] as String,
      type: json['type'] as String,
      display: json['display'] ?? json['accountNumber'] ?? '',
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }
}

class RideHistoryItem {
  final String id;
  final DateTime date;
  final String destination;
  final double price;
  final String status; // 'Completed', 'Cancelled'
  final String driverName;

  RideHistoryItem({
    required this.id,
    required this.date,
    required this.destination,
    required this.price,
    required this.status,
    required this.driverName,
  });
}

class PayoutTransaction {
  final String id;
  final double amount;
  final String destination;
  final String date;
  final String status;

  PayoutTransaction({
    required this.id,
    required this.amount,
    required this.destination,
    required this.date,
    required this.status,
  });

  factory PayoutTransaction.fromJson(Map<String, dynamic> json) {
    return PayoutTransaction(
      id: json['id'] as String,
      amount: (json['amount'] as num).toDouble(),
      destination: json['destination'] ?? json['accountNumber'] ?? '',
      date: json['createdAt'] ?? json['date'] ?? '',
      status: json['status'] as String? ?? 'PENDING',
    );
  }
}

class InsufficientFundsException implements Exception {}

class RideService {
  final http.Client _client;
  String? _authToken;

  RideService({http.Client? client}) : _client = client ?? http.Client();

  String get _dispatchBaseUrl => AppConfig.dispatchApiUrl;
  String get _authBaseUrl => AppConfig.authApiUrl;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_authToken != null) 'Authorization': 'Bearer $_authToken',
      };

  void setAuthToken(String token) => _authToken = token;

  // Get nearby drivers
  Future<List<Map<String, dynamic>>> getNearbyDrivers({
    required double lat,
    required double lng,
    String? vehicleType,
    double maxDistanceKm = 5.0,
  }) async {
    try {
      final queryParams = {
        'pickupLat': lat.toString(),
        'pickupLng': lng.toString(),
        'maxDistanceKm': maxDistanceKm.toString(),
      };
      if (vehicleType != null) {
        queryParams['vehicleType'] = vehicleType;
      }

      final uri = Uri.parse('$_dispatchBaseUrl/rides/nearby-drivers')
          .replace(queryParameters: queryParams);
      final response = await _client.get(uri, headers: _headers);

      if (response.statusCode == 200 && response.body.isNotEmpty && response.body.trim() != 'null') {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['data'] ?? data ?? []);
      }
    } catch (e) {
      debugPrint('Error fetching nearby drivers: $e');
    }
    return [];
  }

  // Create a ride request with vehicle type support and verification status
  Future<Map<String, dynamic>> createRide(
    String passengerId,
    dynamic pickup,
    dynamic dropoff, {
    String? vehicleType,
    bool isVerifiedPassenger = true,
    String? verificationMethod,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides'),
        headers: _headers,
        body: jsonEncode({
          'passengerId': passengerId,
          'pickupLocation': pickup,
          'dropoffLocation': dropoff,
          'vehicleType': vehicleType,
          'isVerifiedPassenger': isVerifiedPassenger,
          if (verificationMethod != null) 'verificationMethod': verificationMethod,
          'fare': 0,
        }),
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        if (response.body.isNotEmpty && response.body.trim() != 'null') {
          return jsonDecode(response.body);
        }
      }
      debugPrint(
          'Failed to create ride: ${response.statusCode} ${response.body}');
    } catch (e) {
      debugPrint('Error creating ride: $e');
    }
    return {'id': null, 'status': 'ERROR'};
  }

  Future<Map<String, dynamic>?> getCurrentRide(
      String userId, String role) async {
    try {
      final response = await _client.get(
        Uri.parse('$_dispatchBaseUrl/rides/current?userId=$userId&role=$role'),
        headers: _headers,
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

  // Cancel a ride request
  Future<bool> cancelRide(String rideId, {String reason = 'Passenger cancelled'}) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/cancel'),
        headers: _headers,
        body: jsonEncode({'reason': reason}),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
      debugPrint('Failed to cancel ride: ${response.statusCode} ${response.body}');
    } catch (e) {
      debugPrint('Error cancelling ride: $e');
    }
    return false;
  }

  // Notify driver has arrived at pickup location
  Future<void> notifyArrival(String rideId) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/arrive-at-stop'),
        headers: _headers,
        body: jsonEncode({'stopIndex': 0}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint('notifyArrival failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('Error notifying arrival: $e');
    }
  }

  // Rate a passenger after a ride
  Future<void> ratePassenger(String rideId, int rating, String comment) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/rate'),
        headers: _headers,
        body: jsonEncode({'rating': rating, 'comment': comment, 'role': 'DRIVER'}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint('ratePassenger failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('Error rating passenger: $e');
    }
  }

  // Rate a driver after a ride
  Future<void> rateDriver(String rideId, int rating, String comment) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/rate'),
        headers: _headers,
        body: jsonEncode({'rating': rating, 'comment': comment, 'role': 'PASSENGER'}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint('rateDriver failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('Error rating driver: $e');
    }
  }

  // Start the trip (driver begins journey)
  Future<void> startTrip(String rideId) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/start'),
        headers: _headers,
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint('startTrip failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('Error starting trip: $e');
    }
  }

  // Complete the trip
  Future<void> completeTrip(String rideId) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/complete'),
        headers: _headers,
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint('completeTrip failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('Error completing trip: $e');
    }
  }

  // Request a payout — delegates to auth-service wallet endpoint
  Future<void> requestPayout(double amount) async {
    try {
      final response = await _client.post(
        Uri.parse('$_authBaseUrl/payouts/request'),
        headers: _headers,
        body: jsonEncode({'amount': amount}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        final body = jsonDecode(response.body);
        if (response.statusCode == 400 &&
            (body['message'] as String?)?.contains('insufficient') == true) {
          throw InsufficientFundsException();
        }
        debugPrint('requestPayout failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      if (e is InsufficientFundsException) rethrow;
      debugPrint('Error requesting payout: $e');
    }
  }

  Future<List<PayoutMethod>> getPayoutMethods() async {
    try {
      final response = await _client.get(
        Uri.parse('$_authBaseUrl/payout-methods'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        return data.map((j) => PayoutMethod.fromJson(j)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching payout methods: $e');
    }
    return [];
  }

  Future<PayoutMethod?> getDefaultPayoutMethod() async {
    final methods = await getPayoutMethods();
    try {
      return methods.firstWhere((m) => m.isDefault);
    } catch (_) {
      return methods.isNotEmpty ? methods.first : null;
    }
  }

  Future<void> setDefaultPayoutMethod(String id) async {
    try {
      await _client.patch(
        Uri.parse('$_authBaseUrl/payout-methods/$id/default'),
        headers: _headers,
      );
    } catch (e) {
      debugPrint('Error setting default payout method: $e');
    }
  }

  Future<void> deletePayoutMethod(String id) async {
    try {
      await _client.delete(
        Uri.parse('$_authBaseUrl/payout-methods/$id'),
        headers: _headers,
      );
    } catch (e) {
      debugPrint('Error deleting payout method: $e');
    }
  }

  Future<void> addPayoutMethod(String type, String details) async {
    try {
      await _client.post(
        Uri.parse('$_authBaseUrl/payout-methods'),
        headers: _headers,
        body: jsonEncode({'type': type, 'accountNumber': details}),
      );
    } catch (e) {
      debugPrint('Error adding payout method: $e');
    }
  }

  Future<List<RideHistoryItem>> getRideHistory(String userId) async {
    try {
      final response = await _client
          .get(Uri.parse('$_dispatchBaseUrl/rides/admin/users/$userId/rides'),
              headers: _headers);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List rides = data['data'];
        return rides.map<RideHistoryItem>((r) {
          final dest = r['dropoffLocation'] is Map
              ? r['dropoffLocation']['address']
              : 'Unknown';
          return RideHistoryItem(
            id: r['id'],
            date: DateTime.tryParse(r['createdAt']) ?? DateTime.now(),
            destination: dest ?? 'Unknown',
            price: double.tryParse(r['fare']?.toString() ?? '0') ?? 0.0,
            status: r['status'] ?? 'Completed',
            driverName: r['driver']?['name'] ?? 'Driver',
          );
        }).toList();
      }
    } catch (e) {
      debugPrint('Error fetching history: $e');
    }
    return [];
  }

  Future<Map<String, dynamic>> getWalletDetails() async {
    try {
      final response = await _client.get(
        Uri.parse('$_authBaseUrl/payment/wallet'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        debugPrint('Wallet fetch failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('Error fetching wallet details: $e');
    }
    return {
      'balance': 0.0,
      'transactions': [],
      'payoutMethod': {'bankName': 'Not set', 'accountNumber': '—'},
    };
  }

  Future<Map<String, dynamic>> getPackageDeliveryFare({
    required dynamic pickup,
    required dynamic destination,
    required String packageSize,
  }) async {
    try {
      final uri = Uri.parse('$_dispatchBaseUrl/dispatch/rides/package-fare')
          .replace(queryParameters: {
        'packageSize': packageSize,
        'pickupLat': pickup['lat']?.toString() ?? '',
        'pickupLng': pickup['lng']?.toString() ?? '',
        'destLat': destination['lat']?.toString() ?? '',
        'destLng': destination['lng']?.toString() ?? '',
      });
      final response = await _client.get(uri, headers: _headers);
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Error fetching package delivery fare: $e');
    }
    return {'fare': 0.0};
  }

  Future<void> createPackageDelivery({
    required dynamic pickup,
    required dynamic destination,
    required String packageSize,
    required String packageDescription,
    required String pickupContact,
    required String dropoffContact,
    required double fare,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/dispatch/rides/package'),
        headers: _headers,
        body: jsonEncode({
          'pickupLocation': pickup,
          'dropoffLocation': destination,
          'packageSize': packageSize,
          'packageDescription': packageDescription,
          'pickupContact': pickupContact,
          'dropoffContact': dropoffContact,
          'fare': fare,
          'rideType': 'PACKAGE',
        }),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint('createPackageDelivery failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('Error creating package delivery: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getScheduledRides() async {
    try {
      final response = await _client.get(
        Uri.parse('$_dispatchBaseUrl/dispatch/rides/scheduled'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['data'] ?? data ?? []);
      }
    } catch (e) {
      debugPrint('Error fetching scheduled rides: $e');
    }
    return [];
  }

  Future<List<Map<String, dynamic>>> getIncentives() async {
    try {
      final response = await _client.get(
        Uri.parse('$_authBaseUrl/incentives'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['data'] ?? data ?? []);
      }
    } catch (e) {
      debugPrint('Error fetching incentives: $e');
    }
    return [];
  }

  Future<Map<String, dynamic>> getPassengerRating() async {
    try {
      final response = await _client.get(
        Uri.parse('$_authBaseUrl/ratings/passenger-summary'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Error fetching passenger rating: $e');
    }
    return {'rating': 5.0, 'totalRides': 0};
  }

  Future<Map<String, dynamic>> getDriverPerformance() async {
    try {
      final response = await _client.get(
        Uri.parse('$_authBaseUrl/ratings/driver-performance'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Error fetching driver performance: $e');
    }
    return {'rating': 4.9, 'acceptanceRate': 0.95};
  }

  Future<void> acceptRide(String rideId) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/accept'),
        headers: _headers,
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint('acceptRide failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('Error accepting ride: $e');
    }
  }

  Future<void> rejectRide(String rideId) async {
    try {
      final response = await _client.post(
        Uri.parse('$_dispatchBaseUrl/rides/$rideId/reject'),
        headers: _headers,
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        debugPrint('rejectRide failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      debugPrint('Error rejecting ride: $e');
    }
  }

  Future<List<PayoutTransaction>> getPayoutHistory() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [];
  }

  Future<void> confirmCashPayment(String rideId) async {
    await Future.delayed(const Duration(seconds: 1));
  }

  Future<void> initiateMpesaPayment(String rideId) async {
    await Future.delayed(const Duration(seconds: 1));
  }

  Future<bool> checkMpesaPaymentStatus(String rideId) async {
    await Future.delayed(const Duration(seconds: 1));
    return true;
  }

  Future<void> submitRating(String rideId, int rating) async {
    await ratePassenger(rideId, rating, "");
  }
}
