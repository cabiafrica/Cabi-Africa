import 'package:driver_app/providers/sos_alert_provider.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SOSAlertProvider', () {
    late SOSAlertProvider provider;

    setUp(() {
      provider = SOSAlertProvider();
    });

    test('initial state is correct', () {
      expect(provider.isAlertActive, isFalse);
      expect(provider.alertData, isNull);
    });

    test('setAlert updates state and notifies listeners', () {
      final alertData = {'rideId': 'sos-123'};
      int listenerCallCount = 0;
      provider.addListener(() => listenerCallCount++);

      provider.setAlert(alertData);

      expect(provider.isAlertActive, isTrue);
      expect(provider.alertData, alertData);
      expect(listenerCallCount, 1);
    });

    test('clearAlert clears state and notifies listeners', () {
      provider.setAlert({'rideId': 'sos-123'}); // Set state first

      provider.clearAlert();

      expect(provider.isAlertActive, isFalse);
      expect(provider.alertData, isNull);
    });
  });
}