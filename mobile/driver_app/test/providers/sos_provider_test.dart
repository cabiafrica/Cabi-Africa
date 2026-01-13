import 'package:driver_app/providers/sos_provider.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('SOSProvider', () {
    late SOSProvider provider;

    setUp(() {
      provider = SOSProvider();
    });

    test('initial state is correct', () {
      expect(provider.isSOSActive, isFalse);
    });

    test('activateSOS sets isSOSActive to true and notifies listeners', () {
      int listenerCallCount = 0;
      provider.addListener(() => listenerCallCount++);

      provider.activateSOS();

      expect(provider.isSOSActive, isTrue);
      expect(listenerCallCount, 1);
    });

    test('deactivateSOS sets isSOSActive to false and notifies listeners', () {
      provider.activateSOS(); // Set to true first

      provider.deactivateSOS();

      expect(provider.isSOSActive, isFalse);
    });
  });
}