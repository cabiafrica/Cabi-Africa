import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:passenger_app/screens/home_screen.dart';
import 'package:passenger_app/services/ride_service.dart';

void main() {
  group('SearchingRadarPulse Widget Tests', () {
    testWidgets('renders SearchingRadarPulse and animates properly',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: SearchingRadarPulse(
                color: Color(0xFFD4AF37),
                size: 80,
              ),
            ),
          ),
        ),
      );

      // Verify radar icon is present
      expect(find.byIcon(Icons.radar_rounded), findsOneWidget);

      // Advance animation frames
      await tester.pump(const Duration(milliseconds: 500));
      expect(find.byIcon(Icons.radar_rounded), findsOneWidget);

      await tester.pump(const Duration(milliseconds: 1000));
      expect(find.byIcon(Icons.radar_rounded), findsOneWidget);
    });
  });

  group('RideService cancelRide Tests', () {
    test('successfully cancels ride with backend', () async {
      final mockClient = MockClient((request) async {
        if (request.url.path.contains('/rides/ride-123/cancel') &&
            request.method == 'POST') {
          final body = jsonDecode(request.body);
          if (body['reason'] == 'Passenger cancelled') {
            return http.Response(jsonEncode({'status': 'CANCELLED'}), 200);
          }
        }
        return http.Response('Not Found', 404);
      });

      final service = RideService(client: mockClient);
      final result = await service.cancelRide('ride-123');
      expect(result, isTrue);
    });

    test('handles backend error gracefully when cancelling ride', () async {
      final mockClient = MockClient((request) async {
        return http.Response('Server Error', 500);
      });

      final service = RideService(client: mockClient);
      final result = await service.cancelRide('ride-456');
      expect(result, isFalse);
    });
  });
}
