import 'package:cabi_flutter/apps/passenger-app/src/screens/search_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget createWidgetUnderTest() {
    return const MaterialApp(home: SearchScreen());
  }

  testWidgets('SearchScreen should build and show suggestions', (
    widgetTester,
  ) async {
    await widgetTester.pumpWidget(createWidgetUnderTest());

    // Verify the app bar and text field are present
    expect(find.byType(AppBar), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);

    // Verify the list of suggestions is displayed
    expect(find.byType(ListView), findsOneWidget);
    expect(find.text('123 Main St, Anytown, USA'), findsOneWidget);
    expect(find.text('Central Park'), findsOneWidget);
  });

  testWidgets('tapping a suggestion returns it to the previous screen', (
    widgetTester,
  ) async {
    dynamic result;

    await widgetTester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) {
            return ElevatedButton(
              onPressed: () async {
                result = await Navigator.of(
                  context,
                ).push(MaterialPageRoute(builder: (_) => const SearchScreen()));
              },
              child: const Text('Go'),
            );
          },
        ),
      ),
    );

    await widgetTester.tap(find.text('Go'));
    await widgetTester.pumpAndSettle();

    // Tap on the first suggestion
    await widgetTester.tap(find.text('123 Main St, Anytown, USA'));
    await widgetTester.pumpAndSettle();

    // Verify that the screen was popped and the correct value was returned
    expect(result, '123 Main St, Anytown, USA');
  });
}
