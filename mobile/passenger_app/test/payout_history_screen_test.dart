import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/payout_history_screen.dart';

void main() {
  testWidgets('PayoutHistoryScreen displays transactions', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: PayoutHistoryScreen()));

    // Initial loading state
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // Wait for future
    await tester.pumpAndSettle();

    // Verify transactions
    expect(find.text('KES 1250.00'), findsOneWidget);
    expect(find.text('Pending'), findsOneWidget);

    expect(find.text('KES 5400.00'), findsOneWidget);
    expect(find.text('Completed'), findsOneWidget);

    expect(find.text('Failed'), findsOneWidget);
  });
}
