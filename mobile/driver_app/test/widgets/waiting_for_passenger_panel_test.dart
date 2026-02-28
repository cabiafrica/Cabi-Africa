import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:driver_app/widgets/waiting_for_passenger_panel.dart';

void main() {
  // WaitingForPassengerPanel reads 'passenger' key (not 'passengerName').
  // It is a Positioned widget so it must live inside a Stack.

  final mockRideDetails = {
    'passenger': 'Jane Doe',
    'phone': '0700000000',
  };

  Widget build(Map<String, dynamic> request) => MaterialApp(
        home: Scaffold(
          body: Stack(
            children: [
              WaitingForPassengerPanel(
                request: request,
                onTripStarted: () {},
              ),
            ],
          ),
        ),
      );

  testWidgets('WaitingForPassengerPanel renders passenger name',
      (tester) async {
    await tester.pumpWidget(build(mockRideDetails));

    expect(find.text('Passenger Arriving...'), findsOneWidget);
    expect(find.text('Jane Doe'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'START TRIP'), findsOneWidget);
  });

  testWidgets('WaitingForPassengerPanel tapping Start Trip shows PIN dialog',
      (tester) async {
    await tester.pumpWidget(build(mockRideDetails));

    await tester.tap(find.widgetWithText(ElevatedButton, 'START TRIP'));
    await tester.pumpAndSettle();

    // PinEntryDialog should now be visible
    expect(find.byType(AlertDialog), findsOneWidget);
  });

  testWidgets('WaitingForPassengerPanel builds without crashing with empty map',
      (tester) async {
    // Only pump one frame — immediately after pumpWidget.
    // This verifies the widget builds without crashing on null keys.
    // We don't call pumpAndSettle to avoid pending timer assertion from
    // any url_launcher or network images in the widget tree.
    await tester.pumpWidget(build({}));

    // Widget tree is present
    expect(find.byType(WaitingForPassengerPanel), findsOneWidget);
  });
}
