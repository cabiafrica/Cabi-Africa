import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

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
}

class InsufficientFundsException implements Exception {}

class RideService {
  final List<PayoutMethod> _payoutMethods = [
    PayoutMethod(
      id: '1',
      type: 'mpesa',
      display: 'M-Pesa: ***678',
      isDefault: true,
    ),
    PayoutMethod(id: '2', type: 'bank', display: 'KCB Bank: ***1234'),
  ];

  String get _dispatchBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:3334/api';
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3334/api';
    }
    return 'http://localhost:3334/api';
  }

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
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data['data'] ?? []);
      }
    } catch (e) {
      debugPrint('Error fetching nearby drivers: $e');
    }
    return [];
  }

  // Create a ride request with vehicle type support
  Future<Map<String, dynamic>> createRide(
    String passengerId,
    dynamic pickup,
    dynamic dropoff, {
    String? vehicleType,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_dispatchBaseUrl/rides'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'passengerId': passengerId,
          'pickupLocation': pickup,
          'dropoffLocation': dropoff,
          'vehicleType': vehicleType,
          'fare': 350.0,
          'distance': 5.0,
          'status': 'REQUESTED'
        }),
      );
      if (response.statusCode == 201) {
        return jsonDecode(response.body);
      }
      debugPrint(
          'Failed to create ride: ${response.statusCode} ${response.body}');
    } catch (e) {
      debugPrint('Error creating ride: $e');
    }
    // Fallback for demo
    return {'id': 'mock-ride-id', 'status': 'REQUESTED'};
  }

  Future<Map<String, dynamic>?> getCurrentRide(
      String userId, String role) async {
    try {
      final response = await http.get(
        Uri.parse('$_dispatchBaseUrl/rides/current?userId=$userId&role=$role'),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      debugPrint('Error fetching current ride: $e');
    }
    return null;
  }

  // Mock method to notify passenger of arrival
  Future<void> notifyArrival(String rideId) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
  }

  // Mock method to rate a passenger
  Future<void> ratePassenger(String rideId, int rating, String comment) async {
    await Future.delayed(const Duration(seconds: 1));
  }

  // Mock method to start the trip
  Future<void> startTrip(String rideId) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
  }

  // Mock method to complete the trip
  Future<void> completeTrip(String rideId) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
  }

  // Mock method to request a payout
  Future<void> requestPayout(double amount) async {
    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));
  }

  Future<List<PayoutMethod>> getPayoutMethods() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _payoutMethods;
  }

  Future<PayoutMethod?> getDefaultPayoutMethod() async {
    await Future.delayed(const Duration(milliseconds: 100));
    try {
      return _payoutMethods.firstWhere((m) => m.isDefault);
    } catch (e) {
      return _payoutMethods.isNotEmpty ? _payoutMethods.first : null;
    }
  }

  Future<void> setDefaultPayoutMethod(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    for (var method in _payoutMethods) {
      method.isDefault = method.id == id;
    }
  }

  Future<void> deletePayoutMethod(String id) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _payoutMethods.removeWhere((m) => m.id == id);
  }

  Future<void> addPayoutMethod(String type, String details) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final newId = (_payoutMethods.length + 1).toString();
    _payoutMethods.add(PayoutMethod(id: newId, type: type, display: details));
  }

  Future<List<RideHistoryItem>> getRideHistory(String userId) async {
    try {
      // Using admin endpoint as proxy for now
      final response = await http
          .get(Uri.parse('$_dispatchBaseUrl/rides/admin/users/$userId/rides'));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List rides = data['data'];
        return rides.map<RideHistoryItem>((r) {
          // Handling potentially missing fields or json structure diffs
          final dest = r['dropoffLocation'] is Map
              ? r['dropoffLocation']['address']
              : 'Unknown';
          return RideHistoryItem(
            id: r['id'],
            date: DateTime.tryParse(r['createdAt']) ?? DateTime.now(),
            destination: dest ?? 'Unknown',
            price: double.tryParse(r['fare']?.toString() ?? '0') ?? 0.0,
            status: r['status'] ?? 'Completed',
            driverName: 'Driver', // Needs join
          );
        }).toList();
      }
    } catch (e) {
      debugPrint('Error fetching history: $e');
    }

    // Fallback if backend fails or empty to preserve UI demo
    return [
      RideHistoryItem(
        id: 'ride-1',
        date: DateTime.now().subtract(const Duration(days: 1)),
        destination: 'Westgate Mall',
        price: 450.0,
        status: 'Completed',
        driverName: 'John Doe',
      ),
      RideHistoryItem(
        id: 'ride-2',
        date: DateTime.now().subtract(const Duration(days: 3)),
        destination: 'JKIA Airport',
        price: 1200.0,
        status: 'Completed',
        driverName: 'Jane Smith',
      ),
      RideHistoryItem(
        id: 'ride-3',
        date: DateTime.now().subtract(const Duration(days: 5)),
        destination: 'CBD',
        price: 0.0,
        status: 'Cancelled',
        driverName: 'N/A',
      ),
    ];
  }

  Future<Map<String, dynamic>> getWalletDetails() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return {
      'balance': 1500.0,
      'transactions': [
        {'type': 'Ride Payment', 'amount': 450.0, 'date': '2023-10-01'},
        {'type': 'Top-up', 'amount': 1000.0, 'date': '2023-09-28'},
      ],
      'payoutMethod': {
        'bankName': 'KCB',
        'accountNumber': '***1234',
      },
    };
  }

  Future<Map<String, dynamic>> getPackageDeliveryFare({
    required dynamic pickup,
    required dynamic destination,
    required String packageSize,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return {'fare': 350.0};
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
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<List<Map<String, dynamic>>> getScheduledRides() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return [];
  }

  Future<List<Map<String, dynamic>>> getIncentives() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return [];
  }

  Future<Map<String, dynamic>> getPassengerRating() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return {'rating': 4.8, 'totalRides': 25};
  }

  Future<Map<String, dynamic>> getDriverPerformance() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return {'rating': 4.9, 'acceptanceRate': 0.95};
  }

  Future<void> acceptRide(String rideId) async {
    // Passenger accepting back-to-back? Or redundant.
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> rejectRide(String rideId) async {
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<List<PayoutTransaction>> getPayoutHistory() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      PayoutTransaction(
        id: 'tx-1',
        amount: 2500.0,
        destination: 'M-Pesa: ***678',
        date: '2023-10-15',
        status: 'Completed',
      ),
      PayoutTransaction(
        id: 'tx-2',
        amount: 1500.0,
        destination: 'Bank: ***1234',
        date: '2023-10-10',
        status: 'Completed',
      ),
    ];
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
