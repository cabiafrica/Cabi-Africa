import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/screens/payout_methods_screen.dart';

void main() {
  testWidgets('PayoutMethodsScreen displays methods and actions', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: PayoutMethodsScreen()));

    // Wait for future to settle
    await tester.pumpAndSettle();

    // Verify AppBar and Add Method FAB are rendered
    expect(find.text('Payout Methods'), findsOneWidget);
    expect(find.text('Add Method'), findsOneWidget);
    expect(find.byIcon(Icons.add), findsOneWidget);
  });
}
