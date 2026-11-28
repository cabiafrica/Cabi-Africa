import 'package:driver_app/providers/ride_request_provider.dart';
import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/widgets/ride_request_modal.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:provider/provider.dart' as legacy_provider;

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
    return ProviderScope(
      child: legacy_provider.MultiProvider(
        providers: [
          legacy_provider.ChangeNotifierProvider(create: (_) => RideRequestProvider()),
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
      ),
    );
  }

  testWidgets('renders ride details correctly', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    expect(find.text('NEW RIDE REQUEST'), findsOneWidget);
    expect(find.textContaining('The Hub Karen'), findsOneWidget);
    expect(find.textContaining('4.8'), findsOneWidget);
    expect(find.textContaining('ACCEPT'), findsOneWidget);
    expect(find.text('Pass'), findsOneWidget);
  });

  testWidgets('shows Verified Passenger badge for verified passengers',
      (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    expect(find.text('Verified'), findsOneWidget);
  });

  testWidgets('shows Unverified badge for unverified passengers',
      (tester) async {
    final unverifiedData = {...mockRideDetails, 'isVerifiedPassenger': false};
    await tester.pumpWidget(
      ProviderScope(
        child: legacy_provider.MultiProvider(
          providers: [
            legacy_provider.ChangeNotifierProvider(create: (_) => RideRequestProvider())
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
      ),
    );

    expect(find.text('Unverified'), findsOneWidget);
  });

  testWidgets('tapping Pass opens confirmation dialog', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.text('Pass'));
    await tester.pumpAndSettle();

    // The pass dialog should appear
    expect(find.byType(AlertDialog), findsOneWidget);
    expect(find.text('Pass Trip'), findsOneWidget);
  });

  testWidgets('tapping Accept calls rideService.acceptRide', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.textContaining('ACCEPT'));
    await tester.pump();

    verify(() => mockRideService.acceptRide('ride-xyz-789', 'test-driver-id'))
        .called(1);
  });
}
