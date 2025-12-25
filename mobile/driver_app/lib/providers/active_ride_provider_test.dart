import 'package:driver_app/providers/active_ride_provider.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('ActiveRideProvider', () {
    late ActiveRideProvider provider;

    setUp(() {
      provider = ActiveRideProvider();
    });

    test('initial state is correct', () {
      expect(provider.activeRide, isNull);
      expect(provider.isRideActive, isFalse);
    });

    test('startRide updates state correctly', () {
      final rideData = {'rideId': 'ride-456'};
      provider.startRide(rideData);
      expect(provider.isRideActive, isTrue);
      expect(provider.activeRide, rideData);
    });

    test('endRide clears the active ride', () {
      provider.startRide({'rideId': 'ride-456'});
      provider.endRide();
      expect(provider.isRideActive, isFalse);
      expect(provider.activeRide, isNull);
    });

    test('updateRideStatus updates the status of the active ride', () {
      provider.startRide({'rideId': 'ride-456', 'status': 'IN_PROGRESS'});
      provider.updateRideStatus('COMPLETED');
      expect(provider.activeRide?['status'], 'COMPLETED');
    });
  });
}