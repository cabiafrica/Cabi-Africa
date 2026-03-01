import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/loyalty_dashboard_screen.dart';

void main() {
  testWidgets('LoyaltyDashboardScreen displays all required components', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: LoyaltyDashboardScreen()));

    // Verify Points Balance
    expect(find.text('Cabi Points Balance'), findsOneWidget);
    expect(find.text('1250'), findsOneWidget);

    // Verify Tier Progress
    expect(find.text('Current Tier: Silver'), findsOneWidget);
    expect(find.byType(LinearProgressIndicator), findsOneWidget);
    expect(find.text('1250 points to reach Gold Tier'), findsOneWidget);

    // Verify Recent Activity
    expect(find.text('Recent Activity'), findsOneWidget);
    expect(find.text('Trip to Westgate Mall'), findsOneWidget);
    expect(find.text('+50'), findsOneWidget);

    // Verify Redeem Button
    final redeemButton = find.widgetWithText(ElevatedButton, 'Redeem Points');
    expect(redeemButton, findsOneWidget);
  });
}
