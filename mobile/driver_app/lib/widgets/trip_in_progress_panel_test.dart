import 'package:driver_app/widgets/trip_in_progress_panel.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

// A simple mock class for callbacks
class MockCallbacks extends Mock {
  void onEndTrip();
  void onSOS();
}

void main() {
  final rideDetails = {
    'rideId': 'test-ride-789',
    'destination': 'Test Destination Address',
  };

  testWidgets(
    'TripInProgressPanel displays details and has actionable buttons',
    (tester) async {
      final mockCallbacks = MockCallbacks();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TripInProgressPanel(
              rideDetails: rideDetails,
              onEndTrip: mockCallbacks.onEndTrip,
              onSOS: mockCallbacks.onSOS,
            ),
          ),
        ),
      );

      // Verify content is displayed
      expect(find.text('Trip in Progress'), findsOneWidget);
      expect(
        find.text('Destination: Test Destination Address'),
        findsOneWidget,
      );

      // Verify action buttons are present
      expect(find.widgetWithIcon(IconButton, Icons.call), findsOneWidget);
      expect(find.widgetWithIcon(IconButton, Icons.message), findsOneWidget);
      expect(find.widgetWithIcon(IconButton, Icons.sos), findsOneWidget);
      expect(find.widgetWithText(ElevatedButton, 'END TRIP'), findsOneWidget);
    },
  );

  testWidgets('tapping "END TRIP" calls the onEndTrip callback', (
    tester,
  ) async {
    final mockCallbacks = MockCallbacks();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: TripInProgressPanel(
            rideDetails: rideDetails,
            onEndTrip: mockCallbacks.onEndTrip,
            onSOS: mockCallbacks.onSOS,
          ),
        ),
      ),
    );

    await tester.tap(find.widgetWithText(ElevatedButton, 'END TRIP'));
    verify(mockCallbacks.onEndTrip()).called(1);
  });
}
