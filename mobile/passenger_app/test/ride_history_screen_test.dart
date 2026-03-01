import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:provider/provider.dart' as legacy_provider;
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/ride_history_screen.dart';
import 'package:passenger_app/services/ride_service.dart';
import 'package:passenger_app/providers/providers.dart';
import 'package:passenger_app/providers/auth_provider.dart';

class MockRideService extends RideService {
  @override
  Future<List<RideHistoryItem>> getRideHistory(String userId) async {
    return [
      RideHistoryItem(
        id: '1',
        date: DateTime.now(),
        destination: 'Westgate Mall',
        price: 450.0,
        status: 'Completed',
        driverName: 'John Doe',
      ),
      RideHistoryItem(
        id: '2',
        date: DateTime.now().subtract(const Duration(days: 1)),
        destination: 'JKIA Airport',
        price: 1200.0,
        status: 'Completed',
        driverName: 'Jane Smith',
      ),
      RideHistoryItem(
        id: '3',
        date: DateTime.now().subtract(const Duration(days: 3)),
        destination: 'CBD',
        price: 300.0,
        status: 'Cancelled',
        driverName: 'Peter Kamau',
      ),
    ];
  }
}

void main() {
  testWidgets('RideHistoryScreen displays list and navigates to details', (
    WidgetTester tester,
  ) async {
    // Prevent RenderFlex overflow in tests
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          rideServiceProvider.overrideWithValue(MockRideService()),
        ],
        child: legacy_provider.ChangeNotifierProvider<AuthProvider>(
          create: (_) => AuthProvider(),
          child: const MaterialApp(home: RideHistoryScreen()),
        ),
      ),
    );

    // Wait for mock data
    await tester.pumpAndSettle();

    // Verify list items
    expect(find.text('Westgate Mall'), findsOneWidget);
    expect(find.text('KES 450'), findsOneWidget);

    expect(find.text('JKIA Airport'), findsOneWidget);
    expect(find.text('KES 1200'), findsOneWidget);

    expect(find.text('CBD'), findsOneWidget);
    // Cancelled ride might show 0 or just status, checking status text from subtitle logic
    // Subtitle format: 'Day/Month • Status'
    expect(find.textContaining('Cancelled'), findsOneWidget);

    // Tap on first item
    await tester.tap(find.text('Westgate Mall'));
    await tester.pumpAndSettle();

    // Verify Details Screen
    expect(find.text('Ride Details'), findsOneWidget);
    expect(find.text('Westgate Mall'), findsOneWidget); // Title in details
    expect(find.text('John Doe'), findsOneWidget); // Driver name
    expect(find.text('Map Snapshot Placeholder'), findsOneWidget);

    // Verify Re-book button
    expect(find.text('Re-book Ride'), findsOneWidget);
  });
}
