import 'package:driver_app/screens/saved_places_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget build() => const MaterialApp(home: SavedPlacesScreen());

  testWidgets('SavedPlacesScreen renders AppBar title', (tester) async {
    await tester.pumpWidget(build());

    expect(find.text('Saved Places'), findsOneWidget);
  });

  testWidgets('SavedPlacesScreen shows default places', (tester) async {
    await tester.pumpWidget(build());
    await tester.pumpAndSettle();

    // Default saved places (Home, Work)
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Work'), findsOneWidget);
  });

  testWidgets('SavedPlacesScreen has a FAB to add places', (tester) async {
    await tester.pumpWidget(build());

    expect(find.byType(FloatingActionButton), findsOneWidget);
  });

  testWidgets('Tapping FAB opens add-place sheet', (tester) async {
    await tester.pumpWidget(build());

    await tester.tap(find.byType(FloatingActionButton));
    await tester.pumpAndSettle();

    // Bottom sheet with text field should appear
    expect(find.byType(BottomSheet), findsOneWidget);
  });
}
