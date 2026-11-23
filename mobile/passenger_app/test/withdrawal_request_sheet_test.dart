import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/widgets/withdrawal_request_sheet.dart';

void main() {
  testWidgets('WithdrawalRequestSheet validates input and triggers callback', (
    WidgetTester tester,
  ) async {
    double? withdrawnAmount;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: WithdrawalRequestSheet(
            availableBalance: 5000.0,
            payoutMethodDisplay: 'M-Pesa: ***678',
            onConfirm: (amount) {
              withdrawnAmount = amount;
            },
          ),
        ),
      ),
    );

    // Verify initial UI
    expect(find.text('Request Withdrawal'), findsOneWidget);
    expect(find.text('Available Balance: KES 5000.00'), findsOneWidget);
    expect(find.text('Payout to: M-Pesa: ***678'), findsOneWidget);

    // Test Validation: Empty input
    await tester.tap(find.text('Confirm Withdrawal'));
    await tester.pump();
    expect(find.text('Please enter an amount'), findsOneWidget);

    // Test Validation: Amount > Balance
    await tester.enterText(find.byType(TextFormField), '6000');
    await tester.tap(find.text('Confirm Withdrawal'));
    await tester.pump();
    expect(find.text('Amount exceeds balance'), findsOneWidget);

    // Test Validation: Amount < Minimum (KES 500)
    await tester.enterText(find.byType(TextFormField), '250');
    await tester.tap(find.text('Confirm Withdrawal'));
    await tester.pump();
    expect(find.text('Minimum withdrawal is KES 500'), findsOneWidget);

    // Test Success
    await tester.enterText(find.byType(TextFormField), '1000');
    await tester.tap(find.text('Confirm Withdrawal'));
    await tester.pump();
    expect(withdrawnAmount, 1000.0);
  });
}
