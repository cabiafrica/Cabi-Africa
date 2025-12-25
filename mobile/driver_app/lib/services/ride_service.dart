import 'dart:async';

class RideService {
  // Simulate completing a trip and returning the calculated fare
  Future<double> completeTrip(String tripId) async {
    // In a real app: POST /rides/{id}/complete
    await Future.delayed(const Duration(seconds: 1));
    print('Trip $tripId completed.');
    return 450.0; // Mock fare amount
  }

  // Simulate confirming cash payment
  Future<void> confirmCashPayment(String tripId) async {
    // In a real app: POST /rides/{id}/confirm-cash
    await Future.delayed(const Duration(seconds: 1));
    print('Cash payment confirmed for trip $tripId.');
  }

  Future<void> acceptRide(String rideId) async {
    await Future.delayed(const Duration(seconds: 1));
    print('Ride $rideId accepted.');
  }

  Future<void> rejectRide(String rideId) async {
    await Future.delayed(const Duration(seconds: 1));
    print('Ride $rideId rejected.');
  }

  Future<void> ratePassenger(String rideId, int rating) async {
    await Future.delayed(const Duration(seconds: 1));
    print('Ride $rideId, rated passenger $rating stars.');
  }

  Future<void> submitRating(
      {required String tripId, required double rating, String? comment}) async {
    await Future.delayed(const Duration(seconds: 1));
    print('Ride $tripId, rated passenger $rating stars. Comment: $comment');
  }
}
