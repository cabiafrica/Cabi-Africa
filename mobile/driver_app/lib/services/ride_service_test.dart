import 'package:flutter_test/flutter_test.dart';
import 'package:driver_app/services/ride_service.dart';

void main() {
  late RideService rideService;

  setUp(() {
    rideService = RideService();
  });

  group('RideService', () {
    const rideId = 'test-ride-123';

    test('acceptRide completes successfully', () async {
      expect(rideService.acceptRide(rideId), completes);
    });

    test('rejectRide completes successfully', () async {
      expect(rideService.rejectRide(rideId), completes);
    });

    test('completeTrip completes successfully', () async {
      final fare = await rideService.completeTrip(rideId);
      expect(fare, 450.0);
    });

    test('confirmCashPayment completes successfully', () async {
      expect(rideService.confirmCashPayment(rideId), completes);
    });
  });
}
