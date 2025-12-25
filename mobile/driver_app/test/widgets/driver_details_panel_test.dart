import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:driver_app/widgets/driver_details_panel.dart';

void main() {
  testWidgets('DriverDetailsPanel displays placeholder text', (tester) async {
    await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: DriverDetailsPanel())));

    expect(find.text('Driver details will be displayed here.'), findsOneWidget);
  });
}
