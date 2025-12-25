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

  // ... (existing methods remain, I'll just append new ones at the end or proper place.
  // actually, replace_file_content replaces the block. checking TargetContent).

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

  Future<List<RideHistoryItem>> getRideHistory() async {
    await Future.delayed(const Duration(milliseconds: 500));
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
