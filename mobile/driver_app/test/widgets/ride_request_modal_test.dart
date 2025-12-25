import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/widgets/ride_request_modal.dart';

class MockRideService extends Mock implements RideService {}

class MockNavigatorObserver extends Mock implements NavigatorObserver {}

class FakeRoute extends Fake implements Route<dynamic> {}

void main() {
  late MockRideService mockRideService;

  final mockRideDetails = {
    'rideId': 'ride-xyz-789',
    'estimatedFare': 450.0,
    'pickupLocation': 'The Hub Karen, Nairobi',
    'destination': 'Jomo Kenyatta International Airport (JKIA)',
  };

  setUpAll(() {
    registerFallbackValue(FakeRoute());
  });

  setUp(() {
    mockRideService = MockRideService();
  });

  // Helper to build the widget within a testable app structure
  Widget createWidgetUnderTest() {
    return MaterialApp(
      home: Scaffold(
        body: RideRequestModal(
          requestData: mockRideDetails,
          rideService: mockRideService,
        ),
      ),
    );
  }

  testWidgets('renders ride details and action buttons correctly', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(createWidgetUnderTest());

    expect(find.text('New Ride Request!'), findsOneWidget);
    expect(find.text('Est. Fare: KES 450.0'), findsOneWidget);
    expect(find.text('From: The Hub Karen, Nairobi'), findsOneWidget);
    expect(
      find.text('To: Jomo Kenyatta International Airport (JKIA)'),
      findsOneWidget,
    );
    expect(find.widgetWithText(ElevatedButton, 'Accept'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'Reject'), findsOneWidget);
  });

  testWidgets(
    'tapping Accept calls rideService.acceptRide and pops navigator',
    (WidgetTester tester) async {
      // Stub the service method
      when(() => mockRideService.acceptRide(any()))
          .thenAnswer((_) async => null);

      // Use a navigator observer to track navigation events
      final mockObserver = MockNavigatorObserver();
      await tester.pumpWidget(
        MaterialApp(
          home: RideRequestModal(
            requestData: mockRideDetails,
            rideService: mockRideService,
          ),
          navigatorObservers: [mockObserver],
        ),
      );

      await tester.tap(find.widgetWithText(ElevatedButton, 'Accept'));
      await tester.pump(); // Show loading indicator

      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.pumpAndSettle(); // Wait for future to complete

      verify(() => mockRideService.acceptRide('ride-xyz-789')).called(1);
      verify(() => mockObserver.didPop(any(), any())).called(1);
    },
  );

  testWidgets(
    'tapping Reject calls rideService.rejectRide and pops navigator',
    (WidgetTester tester) async {
      when(() => mockRideService.rejectRide(any()))
          .thenAnswer((_) async => null);
      final mockObserver = MockNavigatorObserver();

      await tester.pumpWidget(
        MaterialApp(
          home: RideRequestModal(
            requestData: mockRideDetails,
            rideService: mockRideService,
          ),
          navigatorObservers: [mockObserver],
        ),
      );

      await tester.tap(find.widgetWithText(ElevatedButton, 'Reject'));
      await tester.pump();
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      await tester.pumpAndSettle();

      verify(() => mockRideService.rejectRide('ride-xyz-789')).called(1);
      verify(() => mockObserver.didPop(any(), any())).called(1);
    },
  );

  testWidgets('shows SnackBar on accept failure', (WidgetTester tester) async {
    when(() => mockRideService.acceptRide(any()))
        .thenThrow(Exception('Network error'));

    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.widgetWithText(ElevatedButton, 'Accept'));
    await tester.pumpAndSettle();

    expect(find.byType(SnackBar), findsOneWidget);
    expect(
      find.text('Failed to accept ride: Exception: Network error'),
      findsOneWidget,
    );
  });
}
