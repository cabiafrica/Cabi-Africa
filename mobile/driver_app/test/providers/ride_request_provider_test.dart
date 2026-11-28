import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:fake_async/fake_async.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('RideRequestProvider', () {
    late RideRequestProvider provider;

    setUp(() {
      provider = RideRequestProvider();
    });

    test('initial state is correct', () {
      expect(provider.currentRideRequest, isNull);
      expect(provider.countdown, 20);
    });

    test('setRideRequest updates state and starts timer', () {
      final requestData = {'rideId': '123'};
      int listenerCallCount = 0;
      provider.addListener(() => listenerCallCount++);

      provider.setRideRequest(requestData);

      expect(provider.currentRideRequest, requestData);
      expect(listenerCallCount, greaterThan(0));
    });

    test('clearRideRequest clears state and stops timer', () {
      provider.setRideRequest({'rideId': '123'});
      expect(provider.currentRideRequest, isNotNull);

      int listenerCallCount = 0;
      provider.addListener(() => listenerCallCount++);

      provider.clearRideRequest();

      expect(provider.currentRideRequest, isNull);
      expect(listenerCallCount, 1);
    });

    test('timer automatically clears request after 20 seconds', () async {
      final fakeAsync = FakeAsync();
      fakeAsync.run((async) {
        provider.setRideRequest({'rideId': '123'});
        expect(provider.currentRideRequest, isNotNull);

        // Elapse 19 seconds, request should still be active
        async.elapse(const Duration(seconds: 19));
        expect(provider.currentRideRequest, isNotNull);

        // Elapse 2 more seconds, request should be cleared
        async.elapse(const Duration(seconds: 2));
        expect(provider.currentRideRequest, isNull);
      });
    });
  });
}