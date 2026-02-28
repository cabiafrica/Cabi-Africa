import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:driver_app/screens/earnings_screen.dart';

// Simple smoke test for EarningsScreen — it is a static navigation hub
// with no injected service dependency, so we focus on widget presence.

void main() {
  group('EarningsScreen', () {
    Widget buildSubject() => const MaterialApp(
          home: EarningsScreen(),
        );

    testWidgets('renders the AppBar with correct title', (tester) async {
      await tester.pumpWidget(buildSubject());
      expect(find.text('Earnings'), findsOneWidget);
    });

    testWidgets("shows today's earnings banner text", (tester) async {
      await tester.pumpWidget(buildSubject());
      expect(find.text("Today's Earnings"), findsOneWidget);
      expect(find.text('KES 1,890.50'), findsOneWidget);
    });

    testWidgets('shows all four navigation cards', (tester) async {
      await tester.pumpWidget(buildSubject());
      expect(find.text('My Earnings'), findsOneWidget);
      expect(find.text('Trip History'), findsOneWidget);
      expect(find.text('Statements'), findsOneWidget);
      expect(find.text('Earnings Goal'), findsOneWidget);
    });

    testWidgets('shows boost tip banner', (tester) async {
      await tester.pumpWidget(buildSubject());
      expect(find.text('Boost Your Earnings'), findsOneWidget);
    });

    testWidgets('shows stat chip values in the summary banner', (tester) async {
      await tester.pumpWidget(buildSubject());
      // Check that the dynamic stat values are rendered
      expect(find.text('12'), findsOneWidget); // Trips value
      expect(find.text('6.5'), findsOneWidget); // Hours value
      expect(find.text('KES 9,240'), findsOneWidget); // This Week value
    });
  });
}
