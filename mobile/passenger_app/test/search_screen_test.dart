import 'package:passenger_app/screens/search_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('SearchScreen renders correctly and shows location list', (
    tester,
  ) async {
    await tester.pumpWidget(const MaterialApp(home: SearchScreen()));

    // Verify the app bar title and search field are present
    expect(find.byType(TextField), findsOneWidget);

    // Verify the list of dummy locations is displayed
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Work'), findsOneWidget);
  });

  testWidgets('tapping a location pops the screen with the selected data', (
    tester,
  ) async {
    late Map<String, dynamic>? selectedLocation;

    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              selectedLocation =
                  await Navigator.of(context).push<Map<String, dynamic>>(
                MaterialPageRoute(
                  builder: (context) => const SearchScreen(),
                ),
              );
            },
            child: const Text('Go'),
          ),
        ),
      ),
    );

    // Navigate to the SearchScreen
    await tester.tap(find.byType(ElevatedButton));
    await tester.pumpAndSettle();

    // Tap the first location in the list
    await tester.tap(find.text('Home'));
    await tester.pumpAndSettle();

    // Verify the screen was popped and the correct data was returned
    expect(find.byType(SearchScreen), findsNothing);
    expect(selectedLocation, isNotNull);
    expect(selectedLocation!['name'], 'Home');
  });
}
