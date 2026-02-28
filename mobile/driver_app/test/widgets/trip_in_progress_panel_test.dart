import 'package:driver_app/widgets/trip_in_progress_panel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../mocks/image_mocks.dart';

void main() {
  // TripInProgressPanel is a Positioned widget — must live inside a Stack.

  final rideDetails = {
    'rideId': 'test-ride-789',
    'destination': 'Test Destination Address',
  };

  Widget build({VoidCallback? onEndTrip, VoidCallback? onSOS}) => MaterialApp(
        home: Scaffold(
          body: Stack(
            children: [
              TripInProgressPanel(
                rideDetails: rideDetails,
                onEndTrip: onEndTrip ?? () {},
                onSOS: onSOS ?? () {},
              ),
            ],
          ),
        ),
      );

  testWidgets('TripInProgressPanel displays details and has actionable buttons',
      (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());

      expect(find.text('Trip in Progress'), findsOneWidget);
      expect(
          find.text('Destination: Test Destination Address'), findsOneWidget);
      expect(find.widgetWithIcon(IconButton, Icons.call), findsOneWidget);
      expect(find.widgetWithIcon(IconButton, Icons.message), findsOneWidget);
      expect(find.widgetWithIcon(IconButton, Icons.sos), findsOneWidget);
      expect(find.widgetWithText(ElevatedButton, 'END TRIP'), findsOneWidget);
    });
  });

  testWidgets('tapping END TRIP calls the onEndTrip callback', (tester) async {
    await provideMockedNetworkImages(() async {
      bool endTripCalled = false;

      await tester.pumpWidget(build(onEndTrip: () => endTripCalled = true));

      await tester.tap(find.widgetWithText(ElevatedButton, 'END TRIP'));
      await tester.pump();

      expect(endTripCalled, isTrue);
    });
  });

  testWidgets('tapping SOS icon calls the onSOS callback', (tester) async {
    await provideMockedNetworkImages(() async {
      bool sosCalled = false;

      await tester.pumpWidget(build(onSOS: () => sosCalled = true));

      await tester.tap(find.widgetWithIcon(IconButton, Icons.sos));
      await tester.pump();

      expect(sosCalled, isTrue);
    });
  });

  testWidgets('shows booking type banner when bookingType is not ONE_WAY',
      (tester) async {
    await provideMockedNetworkImages(() async {
      final multiLegDetails = {
        ...rideDetails,
        'bookingType': 'ROUND_TRIP',
      };
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: Stack(
            children: [
              TripInProgressPanel(
                rideDetails: multiLegDetails,
                onEndTrip: () {},
                onSOS: () {},
              ),
            ],
          ),
        ),
      ));

      expect(find.text('TYPE: ROUND_TRIP'), findsOneWidget);
    });
  });

  testWidgets('does NOT show booking type banner for ONE_WAY trips',
      (tester) async {
    await provideMockedNetworkImages(() async {
      final oneWayDetails = {
        ...rideDetails,
        'bookingType': 'ONE_WAY',
      };
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          body: Stack(
            children: [
              TripInProgressPanel(
                rideDetails: oneWayDetails,
                onEndTrip: () {},
                onSOS: () {},
              ),
            ],
          ),
        ),
      ));

      expect(find.textContaining('TYPE:'), findsNothing);
    });
  });
}
