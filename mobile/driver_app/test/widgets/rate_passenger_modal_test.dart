import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/widgets/rate_passenger_modal.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import '../mocks/image_mocks.dart';

class MockRideService extends Mock implements RideService {}

void main() {
  late MockRideService mockRideService;

  setUp(() {
    mockRideService = MockRideService();
    // Default success
    when(() => mockRideService.ratePassenger(any(), any())).thenAnswer(
        (_) async => await Future.delayed(const Duration(milliseconds: 100)));
  });

  Widget createWidgetUnderTest() {
    return MaterialApp(
      home: Scaffold(
        body: Builder(
          builder: (context) {
            return Center(
              child: ElevatedButton(
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    builder: (_) => RatePassengerModal(
                      rideService: mockRideService,
                      rideId: 'test-ride-123',
                      passengerName: 'Alex',
                    ),
                  );
                },
                child: const Text('Show Modal'),
              ),
            );
          },
        ),
      ),
    );
  }

  Future<void> openModal(WidgetTester tester) async {
    await tester.tap(find.text('Show Modal'));
    await tester.pumpAndSettle();
  }

  group('RatePassengerModal', () {
    testWidgets('initial state displays passenger name and disabled button', (
      tester,
    ) async {
      await provideMockedNetworkImages(() async {
        await tester.pumpWidget(createWidgetUnderTest());
        await openModal(tester);

        expect(find.text('Rate Your Passenger'), findsOneWidget);
        expect(find.text('Alex'), findsOneWidget);
        expect(find.byIcon(Icons.star_border), findsNWidgets(5));

        final button = tester.widget<ElevatedButton>(
          find.widgetWithText(ElevatedButton, 'Submit Rating'),
        );
        expect(button.onPressed, isNull);
      });
    });

    testWidgets('selecting a rating enables the submit button', (tester) async {
      await provideMockedNetworkImages(() async {
        await tester.pumpWidget(createWidgetUnderTest());
        await openModal(tester);

        // Tap the 3rd star (for a 3-star rating)
        await tester.tap(find.byIcon(Icons.star_border).at(2));
        await tester.pumpAndSettle();

        final button = tester.widget<ElevatedButton>(
          find.widgetWithText(ElevatedButton, 'Submit Rating'),
        );
        expect(button.onPressed, isNotNull);
        expect(find.byIcon(Icons.star), findsNWidgets(3));
      });
    });

    testWidgets(
      'successful submission calls service and shows snackbar',
      (tester) async {
        await provideMockedNetworkImages(() async {
          await tester.pumpWidget(createWidgetUnderTest());
          await openModal(tester);

          // Select rating — tap 5th star
          await tester.tap(find.byIcon(Icons.star_border).at(4));
          await tester.pumpAndSettle();

          // Tap submit
          final submitButton =
              find.widgetWithText(ElevatedButton, 'Submit Rating');
          await tester.tap(submitButton);
          await tester.pump(); // Start _submitRating
          await tester
              .pump(const Duration(milliseconds: 20)); // Allow microtasks

          // Assert loading state
          expect(find.byType(CircularProgressIndicator), findsOneWidget);
          expect(find.text('Submit Rating'), findsNothing);

          await tester.pumpAndSettle(); // Complete futures

          // Verify service call
          verify(() => mockRideService.ratePassenger('test-ride-123', 5))
              .called(1);

          // Assert snackbar text is somewhere in the widget tree
          expect(find.text('Thank you for your feedback!'), findsOneWidget);
        });
      },
    );

    testWidgets('failed submission shows error snackbar and keeps modal open', (
      tester,
    ) async {
      // Arrange
      when(() => mockRideService.ratePassenger(any(), any()))
          .thenAnswer((_) async => throw Exception('Submission failed'));

      await provideMockedNetworkImages(() async {
        await tester.pumpWidget(createWidgetUnderTest());
        await openModal(tester);

        // Select rating
        await tester.tap(find.byIcon(Icons.star_border).first);
        await tester.pumpAndSettle();

        // Tap submit
        await tester.tap(find.widgetWithText(ElevatedButton, 'Submit Rating'));
        await tester.pump(); // Show loading
        await tester.pumpAndSettle(); // Complete futures

        // Assert
        expect(find.byType(CircularProgressIndicator), findsNothing);
        expect(find.textContaining('Failed to submit rating'), findsOneWidget);
        expect(
          find.byType(RatePassengerModal),
          findsOneWidget,
        ); // Modal should still be open
      });
    });
  });
}
