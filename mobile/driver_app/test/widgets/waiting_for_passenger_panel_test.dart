import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:driver_app/widgets/waiting_for_passenger_panel.dart';

void main() {
  final mockRideDetails = {
    'passengerName': 'Jane Doe',
    'pickupLocation': '123 Main St, Anytown',
  };

  testWidgets('WaitingForPassengerPanel renders details and handles tap', (
    WidgetTester tester,
  ) async {
    // Arrange
    bool wasPressed = false;
    void handleStartTrip() {
      wasPressed = true;
    }

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Stack(
            children: [
              WaitingForPassengerPanel(
                request: mockRideDetails,
                onTripStarted: handleStartTrip,
              ),
            ],
          ),
        ),
      ),
    );

    // Assert: Check for all the static and dynamic text
    expect(find.text('Waiting for Passenger'), findsOneWidget);
    expect(find.text('Jane Doe'), findsOneWidget);
    expect(find.text('123 Main St, Anytown'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'Start Trip'), findsOneWidget);

    // Act: Tap the button
    await tester.tap(find.widgetWithText(ElevatedButton, 'Start Trip'));
    await tester.pump();

    // Assert: Check if the callback was triggered
    expect(wasPressed, isTrue);
  });

  testWidgets(
    'WaitingForPassengerPanel handles missing ride details gracefully',
    (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: WaitingForPassengerPanel(
              request: const {}, // Empty map
              onTripStarted: () {},
            ),
          ),
        ),
      );

      // Assert: Check that it falls back to default text
      expect(find.text('Passenger'), findsOneWidget);
      expect(find.text('Pickup Address'), findsOneWidget);
    },
  );
}
