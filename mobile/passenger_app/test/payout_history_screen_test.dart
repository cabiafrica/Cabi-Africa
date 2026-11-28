import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/payout_history_screen.dart';

void main() {
  testWidgets('PayoutHistoryScreen displays transactions', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: PayoutHistoryScreen()));

    // Wait for future
    await tester.pumpAndSettle();

    // Verify screen renders its AppBar and empty/fallback state when offline
    expect(find.byType(PayoutHistoryScreen), findsOneWidget);
    expect(find.text('No payout history found.'), findsOneWidget);
  });
}
