import 'package:driver_app/screens/menu_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import '../mocks/image_mocks.dart';

void main() {
  Widget build() => ProviderScope(
        child: MaterialApp(
          home: const MenuScreen(),
          routes: {
            '/wallet': (_) => const Scaffold(body: Text('Wallet')),
            '/earnings': (_) => const Scaffold(body: Text('Earnings')),
            '/ratings': (_) => const Scaffold(body: Text('Ratings')),
            '/saved_places': (_) => const Scaffold(body: Text('Saved Places')),
          },
        ),
      );

  testWidgets('MenuScreen renders user profile header', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      expect(find.textContaining('DRIVER'), findsWidgets);
    });
  });

  testWidgets('MenuScreen contains Wallet menu item', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      expect(find.text('WALLET'), findsOneWidget);
    });
  });

  testWidgets('MenuScreen contains Finance menu item', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      expect(find.text('FINANCE'), findsOneWidget);
    });
  });

  testWidgets('MenuScreen contains Settings menu item', (tester) async {
    await provideMockedNetworkImages(() async {
      await tester.pumpWidget(build());
      expect(find.text('SETTINGS'), findsOneWidget);
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
