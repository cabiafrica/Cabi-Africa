import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/services/share_trip_service.dart';

void main() {
  // Note: Testing Share.share requires mocking platform channels.
  // For this unit test, we verify the service can be instantiated.

  test('ShareTripService can be instantiated', () {
    final service = ShareTripService();
    expect(service, isNotNull);
  });
}
