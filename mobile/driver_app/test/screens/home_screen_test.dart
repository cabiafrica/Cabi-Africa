import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator_platform_interface/geolocator_platform_interface.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'package:mockito/mockito.dart';

import 'package:driver_app/screens/home_screen.dart';

// Mock for GeolocatorPlatform
class MockGeolocatorPlatform extends Mock
    with MockPlatformInterfaceMixin
    implements GeolocatorPlatform {
  @override
  Future<LocationPermission> checkPermission() =>
      Future.value(LocationPermission.always);

  @override
  Future<LocationPermission> requestPermission() =>
      Future.value(LocationPermission.always);

  @override
  Future<bool> isLocationServiceEnabled() => Future.value(true);

  @override
  Future<Position> getCurrentPosition({LocationSettings? locationSettings}) =>
      Future.value(
        Position(
          latitude: -1.286389,
          longitude: 36.817223,
          timestamp: DateTime.now(),
          accuracy: 0,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          headingAccuracy: 0,
          speed: 0,
          speedAccuracy: 0,
        ),
      );
}

void main() {
  // This is a common setup for tests involving google_maps_flutter
  setUpAll(() {
    TestWidgetsFlutterBinding.ensureInitialized();
    // Mock the platform channel for google_maps
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(
      const MethodChannel('plugins.flutter.io/google_maps_flutter'),
      (MethodCall methodCall) async {
        if (methodCall.method == 'getVisibleRegion') {
          return {
            'southwest': {'latitude': 0.0, 'longitude': 0.0},
            'northeast': {'latitude': 0.0, 'longitude': 0.0},
          };
        }
        return null;
      },
    );
  });

  testWidgets('HomeScreen renders initial widgets correctly', (
    WidgetTester tester,
  ) async {
    GeolocatorPlatform.instance = MockGeolocatorPlatform();

    await tester.pumpWidget(
      const ProviderScope(child: MaterialApp(home: HomeScreen())),
    );
    await tester.pumpAndSettle();

    expect(find.byType(GoogleMap), findsOneWidget);
    expect(find.text('Where to?'), findsOneWidget);
    expect(find.byIcon(Icons.my_location), findsOneWidget);
  });
}
