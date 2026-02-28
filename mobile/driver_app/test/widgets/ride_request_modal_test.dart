import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/widgets/ride_request_modal.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:provider/provider.dart';

class MockRideService extends Mock implements RideService {}

// Updated to match current RideRequestModal widget structure.
// The modal has been updated: shows 'New Ride Request' (no '!'),
// uses 'pickupAddress' key, Reject now opens a confirmation dialog,
// and Accept navigates via pushReplacement.
void main() {
  late MockRideService mockRideService;

  // Updated mock data using the current widget's expected keys
  final mockRideDetails = {
    'rideId': 'ride-xyz-789',
    'pickupAddress': 'The Hub Karen, Nairobi',
    'destination': 'Jomo Kenyatta International Airport (JKIA)',
    'distanceToPickup': '3.2 km',
    'passengerRating': '4.8',
    'estimatedFare': 450.0,
    'isVerifiedPassenger': true,
  };

  setUpAll(() {
    registerFallbackValue(Uri.parse('http://example.com'));
    registerFallbackValue(<String, String>{});
  });

  setUp(() {
    mockRideService = MockRideService();
    when(() => mockRideService.acceptRide(any(), any()))
        .thenAnswer((_) async {});
    when(() => mockRideService.rejectRide(any(), any(), any()))
        .thenAnswer((_) async {});
    when(() => mockRideService.rejectRide(any(), any()))
        .thenAnswer((_) async {});
  });

  Widget createWidgetUnderTest({RideService? service}) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => RideRequestProvider()),
      ],
      child: MaterialApp(
        home: Scaffold(
          body: RideRequestModal(
            requestData: mockRideDetails,
            rideService: service ?? mockRideService,
            driverId: 'test-driver-id',
          ),
        ),
      ),
    );
  }

  testWidgets('renders ride details correctly', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    expect(find.text('New Ride Request'), findsOneWidget);
    expect(find.textContaining('The Hub Karen'), findsOneWidget);
    expect(find.textContaining('distanceToPickup').evaluate(), isEmpty);
    expect(find.textContaining('3.2 km'), findsOneWidget);
    expect(find.textContaining('4.8'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'Accept'), findsOneWidget);
    expect(find.widgetWithText(ElevatedButton, 'Reject'), findsOneWidget);
  });

  testWidgets('shows Verified Passenger badge for verified passengers',
      (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    expect(find.text('Verified Passenger'), findsOneWidget);
  });

  testWidgets('shows Unverified badge for unverified passengers',
      (tester) async {
    final unverifiedData = {...mockRideDetails, 'isVerifiedPassenger': false};
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => RideRequestProvider())
        ],
        child: MaterialApp(
          home: Scaffold(
            body: RideRequestModal(
              requestData: unverifiedData,
              rideService: mockRideService,
              driverId: 'test-driver-id',
            ),
          ),
        ),
      ),
    );

    expect(find.text('Unverified'), findsOneWidget);
  });

  testWidgets('tapping Reject opens confirmation dialog', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.widgetWithText(ElevatedButton, 'Reject'));
    await tester.pumpAndSettle();

    // The reject dialog should appear
    expect(find.byType(AlertDialog), findsOneWidget);
    expect(find.text('Reject Ride'), findsOneWidget);
  });

  testWidgets('tapping Accept calls rideService.acceptRide', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.widgetWithText(ElevatedButton, 'Accept'));
    await tester.pump();

    verify(() => mockRideService.acceptRide('ride-xyz-789', 'test-driver-id'))
        .called(1);
  });
}
