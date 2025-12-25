import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/payout_methods_screen.dart';

void main() {
  testWidgets('PayoutMethodsScreen displays methods and actions', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: PayoutMethodsScreen()));

    // Wait for the mock future to complete
    await tester.pumpAndSettle();

    // Verify initial methods are displayed
    expect(find.text('M-Pesa: ***678'), findsOneWidget);
    expect(find.text('KCB Bank: ***1234'), findsOneWidget);

    // Verify the default badge is shown
    expect(find.text('Default'), findsOneWidget);

    // Verify the FAB is present
    expect(find.byIcon(Icons.add), findsOneWidget);
  });
}
