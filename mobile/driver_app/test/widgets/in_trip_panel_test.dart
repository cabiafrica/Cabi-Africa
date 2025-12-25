import 'package:driver_app/services/ride_service.dart';
import 'package:driver_app/services/sos_service.dart';
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

class MockSosService extends Mock implements SosService {}

void main() {
  late MockRideService mockRideService;
  late MockSosService mockSosService;

  // Mock for permission_handler
  TestWidgetsFlutterBinding.ensureInitialized();
  setupPermissions();

  setUp(() {
    mockRideService = MockRideService();
    mockSosService = MockSosService();
  });

  final rideData = {
    'rideId': 'trip-123',
    'destinationAddress': 'Yaya Centre',
    'passengerName': 'Jane Doe',
  };

  Widget createWidgetUnderTest() {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ActiveRideProvider()),
        ChangeNotifierProvider(create: (_) => SOSProvider()),
      ],
      child: MaterialApp(
        home: Scaffold(
          body: InTripPanel(
            rideData: rideData,
            rideService: mockRideService,
            sosService: mockSosService,
          ),
        ),
      ),
    );
  }

  testWidgets('InTripPanel renders correctly with ride data',
      (widgetTester) async {
    await widgetTester.pumpWidget(createWidgetUnderTest());

    expect(find.text('Trip to: Yaya Centre'), findsOneWidget);
    expect(find.text('Passenger: Jane Doe'), findsOneWidget);
    expect(find.byIcon(Icons.sos), findsOneWidget);
    expect(
        find.widgetWithText(ElevatedButton, 'Complete Trip'), findsOneWidget);
  });
}

void setupPermissions() {
  const MethodChannel channel =
      MethodChannel('flutter.base/permission_handler');

  TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
      .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
    if (methodCall.method == 'requestPermissions') {
      // Simulate granting all requested permissions
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
