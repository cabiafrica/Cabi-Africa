import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/redeem_points_screen.dart';

void main() {
  testWidgets('RedeemPointsScreen displays rewards and handles redemption', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: RedeemPointsScreen()));
    await tester.pump();

    // Verify initial balance renders
    expect(find.text('0 POINTS'), findsOneWidget);

    // Verify rewards are listed
    expect(find.text('100 KES Off Next Ride'), findsOneWidget);
    expect(find.text('Free Ride (up to 1000 KES)'), findsOneWidget);
  });
}
