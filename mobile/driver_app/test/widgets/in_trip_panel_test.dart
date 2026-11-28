import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/providers/active_ride_provider.dart';
import 'package:driver_app/providers/sos_provider.dart';
import 'package:driver_app/widgets/in_trip_panel.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';

class MockRideService extends Mock implements RideService {}

void main() {
  late MockRideService mockRideService;

  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();
    _setupPermissions();
  });

  setUp(() {
    mockRideService = MockRideService();
    // Default stub: completeTrip resolves with mock fare
    when(() => mockRideService.completeTrip(any()))
        .thenAnswer((_) async => 450.0);
  });

  final rideData = {
    'rideId': 'trip-123',
    'destinationAddress': 'Yaya Centre',
    'passengerName': 'Jane Doe',
  };

  Widget createWidgetUnderTest({Map<String, dynamic>? data}) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ActiveRideProvider()),
        ChangeNotifierProvider(create: (_) => SOSProvider()),
      ],
      child: MaterialApp(
        home: Scaffold(
          // InTripPanel is Positioned — needs a Stack
          body: Stack(
            children: [
              InTripPanel(
                rideData: data ?? rideData,
                rideService: mockRideService,
              ),
            ],
          ),
        ),
      ),
    );
  }

  testWidgets('InTripPanel renders correctly with ride data', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    expect(find.text('TRIP IN PROGRESS'), findsOneWidget);
    expect(find.text('Yaya Centre'), findsOneWidget);
    expect(find.text('Jane Doe'), findsOneWidget);
    expect(find.text('Complete Trip'), findsOneWidget);
  });

  testWidgets('tapping Complete Trip calls rideService.completeTrip',
      (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.widgetWithText(ElevatedButton, 'Complete Trip'));
    await tester.pumpAndSettle();

    verify(() => mockRideService.completeTrip('trip-123')).called(1);
  });

  testWidgets('shows snackbar after successful trip completion',
      (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());

    await tester.tap(find.widgetWithText(ElevatedButton, 'Complete Trip'));
    await tester.pumpAndSettle();

    expect(find.byType(SnackBar), findsOneWidget);
    expect(find.textContaining('completed'), findsOneWidget);
  });
}

void _setupPermissions() {
  const MethodChannel channel =
      MethodChannel('flutter.baseflow.com/permissions/methods');

  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
    if (methodCall.method == 'requestPermissions') {
      return {
        (methodCall.arguments as List).first: PermissionStatus.granted.index,
      };
    }
    if (methodCall.method == 'checkPermissionStatus') {
      return PermissionStatus.granted.index;
    }
    return null;
  });
}
