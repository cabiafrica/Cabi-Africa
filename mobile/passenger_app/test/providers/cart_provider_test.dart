import 'package:passenger_app/providers/cart_provider.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('CartProvider', () {
    late CartProvider cartProvider;

    setUp(() {
      cartProvider = CartProvider();
    });

    test('Initial state is empty', () {
      expect(cartProvider.itemCount, 0);
      expect(cartProvider.totalPrice, 0.0);
      expect(cartProvider.cartItems, isEmpty);
    });

    test('addItem adds an item and notifies listeners', () {
      final item = {'id': 'item-1', 'name': 'Test Item', 'price': 100.0};
      int listenerCallCount = 0;
      cartProvider.addListener(() => listenerCallCount++);

      cartProvider.addItem(item);

      expect(cartProvider.itemCount, 1);
      expect(cartProvider.totalPrice, 100.0);
      expect(cartProvider.cartItems.first, item);
      expect(listenerCallCount, 1);
    });

    test('removeItem removes an item and notifies listeners', () {
      final item1 = {'id': 'item-1', 'name': 'Test Item 1', 'price': 100.0};
      final item2 = {'id': 'item-2', 'name': 'Test Item 2', 'price': 50.0};
      cartProvider.addItem(item1);
      cartProvider.addItem(item2);

      int listenerCallCount = 0;
      cartProvider.addListener(() => listenerCallCount++);

      cartProvider.removeItem(item1);

      expect(cartProvider.itemCount, 1);
      expect(cartProvider.totalPrice, 50.0);
      expect(cartProvider.cartItems.first, item2);
      expect(listenerCallCount, 1);
    });

    test('clearCart removes all items and notifies listeners', () {
      final item = {'id': 'item-1', 'name': 'Test Item', 'price': 100.0};
      cartProvider.addItem(item);

      int listenerCallCount = 0;
      cartProvider.addListener(() => listenerCallCount++);

      cartProvider.clearCart();

      expect(cartProvider.itemCount, 0);
      expect(cartProvider.totalPrice, 0.0);
      expect(cartProvider.cartItems, isEmpty);
      expect(listenerCallCount, 1);
    });
  });
}
