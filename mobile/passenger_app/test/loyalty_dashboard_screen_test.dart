import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/loyalty_dashboard_screen.dart';

void main() {
  testWidgets('LoyaltyDashboardScreen displays all required components', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: LoyaltyDashboardScreen()));
    await tester.pump();

    // Verify Points Balance & Tier Progress
    expect(find.text('LOYALTY REWARDS'), findsOneWidget);
    expect(find.text('CABI POINTS BALANCE'), findsOneWidget);
    expect(find.byType(LinearProgressIndicator), findsOneWidget);

    // Verify Recent Activity & Redeem Button
    expect(find.text('RECENT ACTIVITY'), findsOneWidget);
    expect(find.text('REDEEM PRESTIGE POINTS'), findsOneWidget);
  });
}
