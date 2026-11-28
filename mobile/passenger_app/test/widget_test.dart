// Passenger App - Basic smoke test
//
// Verifies the app can be launched without crashing.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:passenger_app/main.dart';

void main() {
  testWidgets('App launches without crashing', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: CabiPassengerApp(),
      ),
    );
    // Verify the app renders at least one widget
    expect(find.byType(MaterialApp), findsOneWidget);
    // Advance past startup timers and dispose cleanly
    await tester.pump(const Duration(seconds: 5));
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump();
  });
}
