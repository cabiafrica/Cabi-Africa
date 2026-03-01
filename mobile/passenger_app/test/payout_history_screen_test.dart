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

    // Verify transactions
    expect(find.text('KES 2500.00'), findsOneWidget);
    expect(find.text('KES 1500.00'), findsOneWidget);
    expect(find.text('Completed'), findsNWidgets(2));
  });
}
