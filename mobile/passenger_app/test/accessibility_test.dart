import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:passenger_app/screens/search_screen.dart';

void main() {
  group('Accessibility Tests', () {
    testWidgets('SearchScreen has accessible text field',
        (WidgetTester tester) async {
      await tester.pumpWidget(const MaterialApp(home: SearchScreen()));

      final textFieldFinder = find.byType(TextField);
      expect(textFieldFinder, findsOneWidget);

      // Verify dropoff hint text is present for screen readers
      expect(find.text('Dropoff location'), findsOneWidget);
    });
  });
}
