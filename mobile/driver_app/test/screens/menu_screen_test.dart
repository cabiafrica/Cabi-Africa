import 'package:driver_app/screens/menu_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import '../mocks/image_mocks.dart';

void main() {
  Widget build() => MaterialApp(
        home: const MenuScreen(),
        routes: {
          '/wallet': (_) => const Scaffold(body: Text('Wallet')),
          '/earnings': (_) => const Scaffold(body: Text('Earnings')),
          '/ratings': (_) => const Scaffold(body: Text('Ratings')),
          '/saved_places': (_) => const Scaffold(body: Text('Saved Places')),
        },
      );

  testWidgets('MenuScreen renders user profile header', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      expect(find.text('John Doe'), findsOneWidget);
    });
  });

  testWidgets('MenuScreen contains Wallet menu item', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      expect(find.text('Wallet'), findsOneWidget);
    });
  });

  testWidgets('MenuScreen contains Earnings menu item', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      expect(find.text('Earnings'), findsOneWidget);
    });
  });

  testWidgets('MenuScreen contains Ratings menu item', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      expect(find.text('Ratings'), findsOneWidget);
    });
  });

  testWidgets('MenuScreen can scroll to show all items', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      await tester.drag(
        find.byType(SingleChildScrollView),
        const Offset(0, -300),
      );
      await tester.pump();
      expect(find.byType(MenuScreen), findsOneWidget);
    });
  });
}
